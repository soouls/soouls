import { createClerkClient } from '@clerk/backend';
import { Inject, Injectable } from '@nestjs/common';
import type { CompleteOnboardingInput, UserProfileData } from '@soouls/api/router';
import { db, eq } from '@soouls/database/client';
import { type UserOnboardingProfile, users } from '@soouls/database/schema';
import { MessagingService } from '../services/messaging.service';

@Injectable()
export class UsersService {
  constructor(@Inject(MessagingService) private readonly messagingService: MessagingService) {}

  private async getProfileRow(userId: string): Promise<UserProfileData> {
    const [profile] = await db
      .select({
        id: users.id,
        clerkId: users.clerkId,
        email: users.email,
        name: users.name,
        themePreference: users.themePreference,
        mascot: users.mascot,
        onboardingCompletedAt: users.onboardingCompletedAt,
        onboardingProfile: users.onboardingProfile,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!profile) {
      throw new Error('User not found.');
    }

    return {
      ...profile,
      onboardingProfile: (profile.onboardingProfile ?? null) as UserOnboardingProfile | null,
    };
  }

  async ensureUser(clerkId: string): Promise<string> {
    // 1. Check if user exists in DB
    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);

    if (existingUser) {
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

    // 3. Create user in DB
    const [newUser] = await db
      .insert(users)
      .values({
        clerkId,
        email,
        name,
        phoneNumber,
        transactionalWhatsappOptIn: Boolean(phoneNumber),
        marketingWhatsappOptIn: Boolean(phoneNumber),
      })
      .returning({ id: users.id });

    await this.messagingService.sendWelcomeSequence(newUser.id);

    return newUser.id;
  }

  async getCurrentProfile(userId: string): Promise<UserProfileData> {
    return this.getProfileRow(userId);
  }

  async completeOnboarding(
    userId: string,
    input: CompleteOnboardingInput,
  ): Promise<UserProfileData> {
    const onboardingProfile: UserOnboardingProfile = {
      version: 1,
      purpose: input.purpose,
      expressionStyle: input.expressionStyle,
      atmosphere: input.atmosphere,
      thinkingRhythm: input.thinkingRhythm,
      companionTone: input.companionTone,
      successDefinition: input.successDefinition ?? null,
      journalContext: input.journalContext ?? null,
      displayName: input.displayName,
      universeName: input.universeName,
      firstEntry: input.firstEntry,
      completedAt: new Date().toISOString(),
    };

    await db
      .update(users)
      .set({
        name: input.displayName,
        themePreference: input.atmosphere,
        onboardingProfile,
        onboardingCompletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    return this.getProfileRow(userId);
  }
}
