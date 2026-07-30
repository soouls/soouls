import { createClerkClient } from '@clerk/backend';
import { Inject, Injectable } from '@nestjs/common';
import { db, eq } from '@soouls/database/client';
import { users, waitlistUsers } from '@soouls/database/schema';
import { getWaitlistEntry, isWaitlistEmail } from '@soouls/database/waitlist-data';
import { GoogleIntegrationService } from '../integrations/google.service';
import { MessagingService } from '../services/messaging.service';

@Injectable()
export class UsersService {
  constructor(
    @Inject(MessagingService) private readonly messagingService: MessagingService,
    @Inject(GoogleIntegrationService)
    private readonly googleIntegrationService: GoogleIntegrationService,
  ) {}

  async ensureUser(clerkId: string): Promise<string> {
    // 1. Check if user exists in DB
    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);

    if (existingUser) {
      void this.messagingService.syncSignupContact(existingUser.id).catch((err) => {
        console.error('[Users] Resend contact sync background failure:', err);
      });
      return existingUser.id;
    }

    // 2. Fetch user details from Clerk
    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) {
      throw new Error('CLERK_SECRET_KEY is not configured');
    }
    const clerk = createClerkClient({ secretKey });
    const clerkUser = await clerk.users.getUser(clerkId);

    // Get primary email
    const primaryEmailId = clerkUser.primaryEmailAddressId;
    const emailObj = clerkUser.emailAddresses.find((e) => e.id === primaryEmailId);
    const email = emailObj?.emailAddress || '';
    const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Anonymous';
    const primaryPhoneNumberId = clerkUser.primaryPhoneNumberId;
    const phoneObj = clerkUser.phoneNumbers.find((phone) => phone.id === primaryPhoneNumberId);
    const phoneNumber = phoneObj?.phoneNumber || null;

    if (!email) {
      throw new Error(`User ${clerkId} has no primary email address.`);
    }

    // 3. Check if this user is on the waitlist
    const onWaitlist = isWaitlistEmail(email);
    const waitlistEntry = onWaitlist ? getWaitlistEntry(email) : null;

    // 4. Atomic Upsert in DB (fixes race condition where parallel requests try to create the same user)
    const [newUser] = await db
      .insert(users)
      .values({
        clerkId,
        email,
        name,
        phoneNumber: phoneNumber || waitlistEntry?.phoneNumber || null,
        isWaitlistUser: onWaitlist,
        accountStatus: onWaitlist ? 'beta' : 'active',
        transactionalWhatsappOptIn: Boolean(phoneNumber || waitlistEntry?.phoneNumber),
        marketingWhatsappOptIn: Boolean(phoneNumber || waitlistEntry?.phoneNumber),
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        subscriptionStatus: 'trialing',
      })
      .onConflictDoUpdate({
        target: users.clerkId,
        set: {
          email,
          name,
          phoneNumber: phoneNumber || waitlistEntry?.phoneNumber || null,
          updatedAt: new Date(),
        },
      })
      .returning({ id: users.id });

    // 5. If on waitlist, update Clerk user metadata to reflect waitlist status
    if (onWaitlist) {
      // Mark the waitlist entry as claimed
      try {
        await db
          .update(waitlistUsers)
          .set({
            claimedAt: new Date(),
            claimedByUserId: newUser.id,
          })
          .where(eq(waitlistUsers.email, email.trim().toLowerCase()));
      } catch {
        // Waitlist entry might not exist in DB yet — that's OK
        console.warn(`[Users] Waitlist claim failed for ${email} — entry may not exist in DB yet`);
      }

      // Sync waitlist status to Clerk publicMetadata so frontend can read it
      try {
        await clerk.users.updateUser(clerkId, {
          publicMetadata: {
            isWaitlistUser: true,
            waitlistClaimedAt: new Date().toISOString(),
          },
        });
      } catch (err) {
        console.error('[Users] Failed to sync waitlist metadata to Clerk:', err);
      }
    }

    // 5. Resend owns the welcome flow. Sync the contact now; fire the automation after onboarding.
    void this.messagingService.syncSignupContact(newUser.id).catch((err) => {
      console.error('[Users] Resend contact sync failure:', err);
    });

    // 6. Try to sync phone number from Google if it was missing
    if (!phoneNumber && !waitlistEntry?.phoneNumber) {
      void this.googleIntegrationService.syncGoogleProfileData(newUser.id, clerkId).catch((err) => {
        console.error('[Users] Google profile sync background failure:', err);
      });
    }

    return newUser.id;
  }

  async updateUser(
    userId: string,
    data: {
      name?: string;
      themePreference?: string;
      preferences?: Record<string, unknown>;
      mascot?: string;
      marketingEmailOptIn?: boolean;
      marketingWhatsappOptIn?: boolean;
      transactionalEmailOptIn?: boolean;
      transactionalWhatsappOptIn?: boolean;
    },
  ): Promise<void> {
    let updateData = data;
    let completedOnboardingNow = false;

    if (data.preferences) {
      const [currentUser] = await db
        .select({ preferences: users.preferences })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      const currentPreferences = (currentUser?.preferences as Record<string, unknown> | null) ?? {};
      completedOnboardingNow =
        data.preferences.onboardingCompleted === true &&
        currentPreferences.onboardingCompleted !== true;

      updateData = {
        ...data,
        preferences: {
          ...currentPreferences,
          ...data.preferences,
        },
      };
    }

    await db
      .update(users)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    if (completedOnboardingNow) {
      void this.messagingService
        .syncSignupContact(userId, { triggerSignupEvent: true })
        .catch((err) => {
          console.error('[Users] Resend onboarding completion automation failure:', err);
        });
    }
  }
}
