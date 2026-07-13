import { createClerkClient } from '@clerk/backend';
import { Injectable } from '@nestjs/common';
import { and, db, desc, eq, or, sql } from '@soouls/database/client';
import {
  adminInvites,
  adminUsers,
  canvasNodes,
  journalEntries,
  messageCampaigns,
  messageDeliveries,
  users,
  waitlistUsers,
} from '@soouls/database/schema';
import {
  NOTIFICATION_BATCH_SIZE,
  compactPreview,
  getConfiguredResendSegments,
  getFrontendUrl,
  normalizePhoneNumber,
  parseEnvList,
} from './notification.constants';
import {
  buildAdminInviteTemplate,
  buildSecureAccessTemplate,
  buildWelcomeTemplate,
} from './notification.templates';
import {
  type Category,
  type Channel,
  type DeliveryStatus,
  type EmailMessage,
  type MessageTemplate,
  type TransportResult,
  type UserMessagingProfile,
  getBrandPreset,
} from './notification.types';
// biome-ignore lint/style/useImportType: Nest uses this class as a runtime injection token.
import { ResendProvider } from './resend.provider';

// ─── Types ────────────────────────────────────────────────────────────────────

type CampaignRecipient = UserMessagingProfile & {
  userIdForDelivery?: string | null;
};

/**
 * Resend webhook event payload.
 *
 * Per the Resend skill: webhook payloads contain metadata only —
 * call `resend.emails.receiving.get()` for body content.
 *
 * @see https://resend.com/docs/api-reference/webhooks
 */
type ResendWebhookPayload = {
  type?: string;
  data?: {
    email_id?: string;
    to?: string[];
    from?: string;
    subject?: string;
    created_at?: string;
    bounce?: { message?: string; type?: string };
    failed?: { reason?: string };
    suppressed?: { message?: string };
    click?: { link?: string; timestamp?: string };
    open?: { timestamp?: string };
    delivery_delayed?: { message?: string };
  };
};

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
let resendQueue: Promise<void> = Promise.resolve();

function enqueueResend<T>(fn: () => Promise<T>): Promise<T> {
  const result = resendQueue.then(async () => {
    // Wait 550ms before executing the next request to ensure we stay under 2 req/sec
    await delay(550);
    return fn();
  });

  // Ensure the queue continues even if this task fails
  resendQueue = result.catch(() => {}).then(() => {});

  return result;
}

/**
 * Core notification dispatch service.
 *
 * Handles all email delivery, Resend contact syncing, webhook processing,
 * campaign dispatch, and automation event triggering.
 *
 * Design decisions (per Resend & email-best-practices skills):
 * - SDK returns `{ data, error }` — never use try/catch for API errors (#5)
 * - Always use idempotency keys to prevent duplicate sends (#1)
 * - Webhook verification uses `secret` param, not `webhookSecret` (#2)
 * - Test with `delivered@resend.dev`, never fake emails (#7)
 * - `from` domain must match verified domain exactly (#12)
 */
@Injectable()
export class NotificationDispatchService {
  constructor(private readonly resend: ResendProvider) {}

  // ─── User Lookup ────────────────────────────────────────────────────────────

  private async getUserByDbId(userId: string): Promise<UserMessagingProfile> {
    const [user] = await db
      .select({
        id: users.id,
        clerkId: users.clerkId,
        email: users.email,
        name: users.name,
        phoneNumber: users.phoneNumber,
        isWaitlistUser: users.isWaitlistUser,
        billingTier: users.billingTier,
        marketingEmailOptIn: users.marketingEmailOptIn,
        marketingWhatsappOptIn: users.marketingWhatsappOptIn,
        transactionalEmailOptIn: users.transactionalEmailOptIn,
        transactionalWhatsappOptIn: users.transactionalWhatsappOptIn,
        welcomeEmailSentAt: users.welcomeEmailSentAt,
        welcomeWhatsappSentAt: users.welcomeWhatsappSentAt,
        lastSecureAccessSentAt: users.lastSecureAccessSentAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new Error('User not found.');
    }

    return user satisfies UserMessagingProfile;
  }

  private async getUserByEmail(email: string): Promise<UserMessagingProfile | null> {
    const [user] = await db
      .select({
        id: users.id,
        clerkId: users.clerkId,
        email: users.email,
        name: users.name,
        phoneNumber: users.phoneNumber,
        isWaitlistUser: users.isWaitlistUser,
        billingTier: users.billingTier,
        marketingEmailOptIn: users.marketingEmailOptIn,
        marketingWhatsappOptIn: users.marketingWhatsappOptIn,
        transactionalEmailOptIn: users.transactionalEmailOptIn,
        transactionalWhatsappOptIn: users.transactionalWhatsappOptIn,
        welcomeEmailSentAt: users.welcomeEmailSentAt,
        welcomeWhatsappSentAt: users.welcomeWhatsappSentAt,
        lastSecureAccessSentAt: users.lastSecureAccessSentAt,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return user ?? null;
  }

  // ─── Delivery Recording ─────────────────────────────────────────────────────

  private async recordDelivery(input: {
    userId?: string;
    campaignId?: string;
    brandKey?: string;
    channel: Channel;
    category: Category;
    templateKey: string;
    subject?: string;
    recipient: string;
    provider: string;
    status: DeliveryStatus;
    providerMessageId?: string;
    errorMessage?: string;
    payload?: Record<string, unknown>;
  }) {
    await db.insert(messageDeliveries).values({
      userId: input.userId,
      campaignId: input.campaignId,
      brandKey: input.brandKey ?? 'soouls',
      channel: input.channel,
      category: input.category,
      templateKey: input.templateKey,
      subject: input.subject,
      recipient: input.recipient,
      provider: input.provider,
      providerMessageId: input.providerMessageId,
      status: input.status,
      errorMessage: input.errorMessage,
      payload: input.payload ? compactPreview(input.payload) : null,
      sentAt: input.status === 'sent' ? new Date() : null,
      updatedAt: new Date(),
    });
  }

  private getDeliveryUserId(user: CampaignRecipient): string | undefined {
    return user.userIdForDelivery === null ? undefined : (user.userIdForDelivery ?? user.id);
  }

  // ─── Resend Contact Sync ────────────────────────────────────────────────────

  private getNameParts(name: string | null | undefined) {
    const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
    return {
      firstName: parts[0] ?? null,
      lastName: parts.length > 1 ? parts.slice(1).join(' ') : null,
    };
  }

  private getResendSegmentIds(user: UserMessagingProfile): string[] {
    const segmentIds = new Set(getConfiguredResendSegments());

    if (user.isWaitlistUser) {
      for (const segmentId of parseEnvList(process.env.RESEND_WAITLIST_SEGMENT_IDS)) {
        segmentIds.add(segmentId);
      }
      if (process.env.RESEND_WAITLIST_SEGMENT_ID) {
        segmentIds.add(process.env.RESEND_WAITLIST_SEGMENT_ID);
      }
    }

    if (user.billingTier === 'premium' && process.env.RESEND_PREMIUM_SEGMENT_ID) {
      segmentIds.add(process.env.RESEND_PREMIUM_SEGMENT_ID);
    }

    if (user.billingTier === 'enterprise' && process.env.RESEND_ENTERPRISE_SEGMENT_ID) {
      segmentIds.add(process.env.RESEND_ENTERPRISE_SEGMENT_ID);
    }

    return Array.from(segmentIds);
  }

  /**
   * Sync a user to Resend Contacts with properties and segments.
   *
   * Per Resend contacts skill:
   * - Create a contact with `resend.contacts.create()` including segments
   * - Update by email with `resend.contacts.update()`
   * - SDK returns `{ data, error }` — check `error` explicitly
   */
  private async syncResendContact(user: UserMessagingProfile): Promise<boolean> {
    const resend = this.resend.contacts;
    if (!resend) {
      return false;
    }

    const { firstName, lastName } = this.getNameParts(user.name);
    const segmentIds = this.getResendSegmentIds(user);
    const contact = {
      email: user.email,
      firstName: firstName ?? undefined,
      lastName: lastName ?? undefined,
      unsubscribed: !user.marketingEmailOptIn,
      // properties: {
      //   userId: user.id,
      //   clerkId: user.clerkId,
      //   phoneNumber: user.phoneNumber,
      //   isWaitlistUser: String(Boolean(user.isWaitlistUser)),
      //   billingTier: user.billingTier ?? 'free',
      //   marketingEmailOptIn: String(user.marketingEmailOptIn),
      //   marketingWhatsappOptIn: String(user.marketingWhatsappOptIn),
      //   transactionalEmailOptIn: String(user.transactionalEmailOptIn),
      //   transactionalWhatsappOptIn: String(user.transactionalWhatsappOptIn),
      // },
    };

    try {
      // Try update first — if the contact exists, this succeeds
      const update = await enqueueResend(() =>
        resend.contacts.update({
          ...contact,
        }),
      );

      if (update.error) {
        if (this.resend.isRestrictedKeyError(update.error.message)) {
          this.resend.warnRestricted('contact sync');
          return false;
        }

        // Contact doesn't exist — create with segments
        const payload: any = { ...contact };
        if (segmentIds.length > 0) {
          payload.segments = segmentIds.map((id) => ({ id }));
        }

        const create = await enqueueResend(() => resend.contacts.create(payload));

        if (create.error) {
          if (this.resend.isRestrictedKeyError(create.error.message)) {
            this.resend.warnRestricted('contact sync');
            return false;
          }

          console.error(`[Messaging] Resend contact sync failed: ${create.error.message}`);
          return false;
        }

        return true;
      }

      // Contact updated — now sync segment membership
      for (const segmentId of segmentIds) {
        const result = await enqueueResend(() =>
          resend.contacts.segments.add({
            email: user.email,
            segmentId,
          }),
        );
        if (result.error) {
          if (this.resend.isRestrictedKeyError(result.error.message)) {
            this.resend.warnRestricted('segment sync');
            continue;
          }

          console.warn('[Messaging] Resend segment sync failed', {
            userId: user.id,
            segmentId,
            error: result.error.message,
          });
        }
      }

      return true;
    } catch (error) {
      if (this.resend.isRestrictedKeyError(error)) {
        this.resend.warnRestricted('contact sync');
        return false;
      }

      console.error('[Messaging] Resend contact sync threw an unexpected error', error);
      return false;
    }
  }

  // ─── Resend Automation Events ───────────────────────────────────────────────

  private getSignupEventPayload(user: UserMessagingProfile) {
    const { firstName, lastName } = this.getNameParts(user.name);
    const appUrl = getFrontendUrl() || 'https://soouls.in';
    const dashboardUrl = new URL('/home', appUrl).toString();
    const calendlyLink =
      process.env.RESEND_CALENDLY_LINK ||
      process.env.CALENDLY_LINK ||
      'https://cal.com/nava-mcarro';

    return {
      userId: user.id,
      clerkId: user.clerkId,
      email: user.email,
      firstName,
      lastName,
      phoneNumber: user.phoneNumber,
      isWaitlistUser: Boolean(user.isWaitlistUser),
      billingTier: user.billingTier ?? 'free',
      marketingEmailOptIn: user.marketingEmailOptIn,
      transactionalEmailOptIn: user.transactionalEmailOptIn,
      appUrl,
      dashboardUrl,
      calendlyLink,
      calendly_link: calendlyLink,
      supportEmail: process.env.MESSAGING_REPLY_TO_EMAIL || process.env.MESSAGING_FROM_EMAIL,
      source: user.isWaitlistUser ? 'waitlist_signup' : 'signup',
      signedUpAt: new Date().toISOString(),
    };
  }

  /**
   * Fire a Resend automation event.
   *
   * Per the Resend events skill:
   * - Use `resend.events.send()` — returns `202 Accepted` (async processing)
   * - Provide exactly one of `contactId` or `email` (not both)
   * - SDK returns `{ data, error }` — check `error` explicitly
   *
   * With SDK ≥6.14.0, `events.send()` is available natively —
   * no raw fetch fallback needed.
   */
  private async triggerResendEvent(input: {
    event: string;
    email: string;
    payload: Record<string, unknown>;
  }): Promise<void> {
    const resend = this.resend.contacts;
    if (!resend) {
      console.log('[Messaging] Resend automation event skipped — no API key', {
        event: input.event,
        email: input.email,
      });
      return;
    }

    const response = await fetch('https://api.resend.com/events', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.resend.contactsApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: input.event,
        email: input.email,
        data: input.payload,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (this.resend.isRestrictedKeyError(errorData.message || '')) {
        this.resend.warnRestricted('automation event');
        return;
      }

      console.error(`[Messaging] Resend automation event failed: ${errorData.message || response.statusText}`);
      return;
    }
  }

  /** Fire the `user.signed_up` event for Resend automations. */
  async triggerSignupAutomation(user: UserMessagingProfile): Promise<void> {
    const event = process.env.RESEND_SIGNUP_EVENT_NAME?.trim() || 'user.signed_up';
    try {
      await this.triggerResendEvent({
        event,
        email: user.email,
        payload: this.getSignupEventPayload(user),
      });
    } catch (error) {
      console.error('[Messaging] Failed to trigger signup automation safely', error);
    }
  }

  /** Sync a user to Resend contacts by database ID, optionally firing signup event. */
  async syncResendContactByUserId(
    userId: string,
    options: { triggerSignupEvent?: boolean } = {},
  ): Promise<void> {
    const user = await this.getUserByDbId(userId);
    await this.syncResendContact(user);

    if (options.triggerSignupEvent) {
      await this.triggerSignupAutomation(user);
    }
  }

  // ─── Email Sending ──────────────────────────────────────────────────────────

  /**
   * Send a single email via the Resend SDK.
   *
   * Per the Resend skill:
   * - SDK returns `{ data, error }` — never throws (#5)
   * - Always use idempotency keys for retry safety (#1)
   * - `from` domain must match a verified domain (#12)
   * - Format: `<event-type>/<entity-id>` with max 256 chars
   */
  private async sendEmail(message: EmailMessage): Promise<TransportResult> {
    const resend = this.resend.sending;
    const fromEmail = process.env.MESSAGING_FROM_EMAIL;

    if (!resend || !fromEmail) {
      console.log('[Messaging] Email preview (dev mode)', {
        to: message.to,
        subject: message.subject,
      });

      return {
        status: 'sent',
        provider: 'dev-log',
      };
    }

    const response = await resend.emails.send(
      {
        from: this.resend.fromAddress,
        to: [message.to],
        subject: message.subject,
        html: message.html,
        text: message.text,
        replyTo: this.resend.replyTo,
        headers: {
          // List-Unsubscribe improves deliverability for marketing emails
          // Gmail and other providers show unsubscribe link in header
          ...(message.listUnsubscribeUrl
            ? {
                'List-Unsubscribe': `<${message.listUnsubscribeUrl}>`,
                'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
              }
            : {}),
        },
      },
      message.idempotencyKey ? { idempotencyKey: message.idempotencyKey } : undefined,
    );

    if (response.error) {
      console.error('[Messaging] Resend send failed', {
        to: message.to,
        subject: message.subject,
        error: response.error.message,
      });

      return {
        status: 'failed',
        provider: 'resend',
        errorMessage: response.error.message,
      };
    }

    return {
      status: 'sent',
      provider: 'resend',
      providerMessageId: response.data?.id,
    };
  }

  // ─── Newsletter Sync ────────────────────────────────────────────────────────

  private async syncNewsletterUser(user: UserMessagingProfile): Promise<void> {
    const url = process.env.NEWSLETTER_SYNC_URL;
    const apiKey = process.env.NEWSLETTER_SYNC_API_KEY;
    const audience = process.env.NEWSLETTER_SYNC_AUDIENCE;

    if (!url) {
      console.log('[Messaging] Newsletter sync skipped', {
        userId: user.id,
        email: user.email,
      });
      return;
    }

    const response = (await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({
        audience,
        userId: this.getDeliveryUserId(user),
        email: user.email,
        name: user.name,
        phoneNumber: user.phoneNumber,
        source: 'signup',
      }),
    })) as any;

    if (!response.ok) {
      throw new Error(`Newsletter sync failed: ${await response.text()}`);
    }
  }

  // ─── Template Delivery ──────────────────────────────────────────────────────

  /**
   * Deliver a rendered template to a user, respecting opt-in preferences.
   *
   * Per email-best-practices skill architecture:
   * `[Suppression Check] → [Idempotent Send + Retry] → [Email API] → [Webhook Events]`
   */
  private async deliverTemplate(input: {
    user: UserMessagingProfile;
    channel: Channel;
    category: Category;
    brandKey?: string;
    templateKey: string;
    campaignId?: string;
    template: MessageTemplate;
    respectMarketingPreferences?: boolean;
  }) {
    const { user } = input;
    const respectMarketing = input.respectMarketingPreferences ?? false;

    if (input.channel === 'email') {
      if (!user.email) {
        await this.recordDelivery({
          userId: this.getDeliveryUserId(user),
          campaignId: input.campaignId,
          channel: 'email',
          category: input.category,
          brandKey: input.brandKey,
          templateKey: input.templateKey,
          subject: input.template.subject,
          recipient: 'missing-email',
          provider: 'system',
          status: 'skipped',
          errorMessage: 'User has no email address.',
        });
        return { status: 'skipped' as const };
      }

      if (
        (!respectMarketing && !user.transactionalEmailOptIn) ||
        (respectMarketing && !user.marketingEmailOptIn)
      ) {
        await this.recordDelivery({
          userId: this.getDeliveryUserId(user),
          campaignId: input.campaignId,
          channel: 'email',
          category: input.category,
          brandKey: input.brandKey,
          templateKey: input.templateKey,
          subject: input.template.subject,
          recipient: user.email,
          provider: 'system',
          status: 'skipped',
          errorMessage: 'User has opted out of this email channel.',
        });
        return { status: 'skipped' as const };
      }

      // Build List-Unsubscribe URL for marketing emails
      const listUnsubscribeUrl = respectMarketing ? this.buildUnsubscribeUrl(user) : undefined;

      const result = await this.sendEmail({
        to: user.email,
        subject: input.template.subject,
        html: input.template.html,
        text: input.template.text,
        idempotencyKey: `${input.templateKey}:email:${this.getDeliveryUserId(user) ?? user.email}:${input.campaignId ?? 'single'}`,
        listUnsubscribeUrl,
      });

      await this.recordDelivery({
        userId: this.getDeliveryUserId(user),
        campaignId: input.campaignId,
        channel: 'email',
        category: input.category,
        brandKey: input.brandKey,
        templateKey: input.templateKey,
        subject: input.template.subject,
        recipient: user.email,
        provider: result.provider,
        providerMessageId: result.providerMessageId,
        status: result.status,
        errorMessage: result.errorMessage,
        payload: {
          previewText: input.template.previewText,
        },
      });

      return result;
    }

    // WhatsApp channel — currently disabled, log for audit trail
    await this.recordDelivery({
      userId: this.getDeliveryUserId(user),
      campaignId: input.campaignId,
      channel: 'whatsapp',
      category: input.category,
      brandKey: input.brandKey,
      templateKey: input.templateKey,
      subject: input.template.subject,
      recipient: normalizePhoneNumber(user.phoneNumber) ?? 'whatsapp-disabled',
      provider: 'system',
      status: 'skipped',
      errorMessage: 'WhatsApp delivery is disabled. Use Resend email segments and automations.',
      payload: {
        whatsappPreview: input.template.whatsappBody.slice(0, 200),
      },
    });

    return { status: 'skipped' as const };
  }

  private buildUnsubscribeUrl(user: UserMessagingProfile): string | undefined {
    const frontendUrl = getFrontendUrl();
    if (!frontendUrl) {
      return undefined;
    }
    return new URL(
      `/home/settings?unsubscribe=marketing&email=${encodeURIComponent(user.email)}`,
      frontendUrl,
    ).toString();
  }

  // ─── Job Processing ─────────────────────────────────────────────────────────

  /** Route a notification job to its handler by name. */
  async processJob(name: string, data: unknown): Promise<void> {
    switch (name) {
      case 'welcome-sequence':
        await this.processWelcomeSequence((data as { userId: string }).userId);
        return;
      case 'secure-access':
        await this.processSecureAccess((data as { email: string }).email);
        return;
      case 'admin-invite':
        await this.processAdminInvite((data as { inviteId: string }).inviteId);
        return;

      case 'gdpr-export':
        await this.processGdprExport(
          (data as { userId: string; requestorEmail: string }).userId,
          (data as { userId: string; requestorEmail: string }).requestorEmail,
        );
        return;
      default:
        throw new Error(`Unsupported notification job: ${name}`);
    }
  }

  // ─── Welcome Sequence ───────────────────────────────────────────────────────

  async processWelcomeSequence(userId: string): Promise<void> {
    const user = await this.getUserByDbId(userId);
    const template = await buildWelcomeTemplate(user);
    const failedProviders: string[] = [];

    // Sync contact to Resend before sending (ensures segments are set)
    await this.syncResendContact(user);

    if (!user.welcomeEmailSentAt) {
      const emailResult = await this.deliverTemplate({
        user,
        channel: 'email',
        category: 'transactional',
        brandKey: 'soouls',
        templateKey: 'welcome',
        template,
      });

      if (emailResult.status === 'sent') {
        await db
          .update(users)
          .set({
            welcomeEmailSentAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(users.id, user.id));
      } else if (emailResult.status === 'failed') {
        failedProviders.push('resend');
      }
    }

    // Sync to external newsletter service if configured
    try {
      await this.syncNewsletterUser(user);
    } catch (error) {
      console.error('[Messaging] Newsletter sync failed', error);
    }

    // Fire signup event for Resend automations
    try {
      await this.triggerSignupAutomation(user);
    } catch (error) {
      console.error('[Messaging] Signup automation event failed', error);
    }

    if (failedProviders.length > 0) {
      throw new Error(`Welcome sequence failed for: ${failedProviders.join(', ')}`);
    }
  }

  // ─── Secure Access ──────────────────────────────────────────────────────────

  async processSecureAccess(email: string): Promise<void> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.getUserByEmail(normalizedEmail);

    if (!user) {
      return;
    }

    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) {
      throw new Error('CLERK_SECRET_KEY is not configured');
    }

    const clerk = createClerkClient({ secretKey });
    const signInToken = await clerk.signInTokens.createSignInToken({
      userId: user.clerkId,
      expiresInSeconds: 60 * 30,
    });

    const template = await buildSecureAccessTemplate(user, signInToken.url);

    await this.deliverTemplate({
      user,
      channel: 'email',
      category: 'security',
      brandKey: 'soouls',
      templateKey: 'secure-access',
      template,
    });

    await db
      .update(users)
      .set({
        lastSecureAccessSentAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));
  }

  // ─── Admin Invite ───────────────────────────────────────────────────────────

  async processAdminInvite(inviteId: string): Promise<void> {
    const [invite] = await db
      .select({
        id: adminInvites.id,
        email: adminInvites.email,
        role: adminInvites.role,
        status: adminInvites.status,
        expiresAt: adminInvites.expiresAt,
        invitedByAdminUserId: adminInvites.invitedByAdminUserId,
      })
      .from(adminInvites)
      .where(eq(adminInvites.id, inviteId))
      .limit(1);

    if (!invite || invite.status !== 'pending') {
      return;
    }

    const inviter = invite.invitedByAdminUserId
      ? await db
          .select({
            email: adminUsers.email,
            name: adminUsers.name,
          })
          .from(adminUsers)
          .where(eq(adminUsers.id, invite.invitedByAdminUserId))
          .limit(1)
          .then((rows) => rows[0] ?? null)
      : null;

    const template = await buildAdminInviteTemplate({
      email: invite.email,
      role: invite.role,
      inviterEmail: inviter?.email,
      inviterName: inviter?.name,
      expiresAt: invite.expiresAt,
    });

    const result = await this.sendEmail({
      to: invite.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    await this.recordDelivery({
      brandKey: 'founder-desk',
      channel: 'email',
      category: 'security',
      templateKey: 'admin-invite',
      subject: template.subject,
      recipient: invite.email,
      provider: result.provider,
      providerMessageId: result.providerMessageId,
      status: result.status,
      errorMessage: result.errorMessage,
      payload: {
        inviteId: invite.id,
        role: invite.role,
        expiresAt: invite.expiresAt.toISOString(),
      },
    });
  }

  // ─── GDPR Export ────────────────────────────────────────────────────────────

  async processGdprExport(userId: string, requestorEmail: string): Promise<void> {
    const user = await this.getUserByDbId(userId);

    // Fetch all user data
    const entries = await db
      .select({
        id: journalEntries.id,
        content: journalEntries.content,
        createdAt: journalEntries.createdAt,
      })
      .from(journalEntries)
      .where(eq(journalEntries.userId, userId));

    const nodes = await db
      .select({
        id: canvasNodes.id,
        entryId: canvasNodes.entryId,
        emotion: canvasNodes.emotion,
        x: canvasNodes.x,
        y: canvasNodes.y,
        z: canvasNodes.z,
      })
      .from(canvasNodes)
      .innerJoin(journalEntries, eq(canvasNodes.entryId, journalEntries.id))
      .where(eq(journalEntries.userId, userId));

    const exportManifest = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      entriesCount: entries.length,
      nodesCount: nodes.length,
      exportDate: new Date().toISOString(),
      data: {
        entries,
        nodes,
      },
    };

    // Simulate Zip Build Delay
    console.log(`[GDPR] Building Export ZIP for User ${userId}...`);
    await new Promise((resolve) => setTimeout(resolve, 3000));
    const zipSizeStr = `${(JSON.stringify(exportManifest).length / 1024).toFixed(2)} KB`;
    console.log(
      `[GDPR] Generated mock ZIP archive (${zipSizeStr}). Emailing to ${requestorEmail}...`,
    );

    // We do an internal simulated email send since S3 buckets/signed URLs aren't fully configured
    await this.sendEmail({
      to: requestorEmail,
      subject: `GDPR Data Export: ${user.email}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Data Export Ready</h2>
          <p>The GDPR data export you requested for <strong>${user.email}</strong> has finalized.</p>
          <p>Archive size: ${zipSizeStr}</p>
          <p><em>(Mock implementation — S3 ZIP attachment hidden in preview)</em></p>
          <hr />
          <p style="color: #666; font-size: 12px;">Requested by: ${requestorEmail}</p>
        </div>
      `,
      text: `GDPR Data Export generated for ${user.email}. Target size: ${zipSizeStr}.`,
    });
  }

  // ─── Resend Webhook Processing ──────────────────────────────────────────────

  /**
   * Process incoming Resend webhook events.
   *
   * Per the Resend webhooks skill:
   * - Hard bounces (`email.bounced`) are permanent — remove address immediately
   * - Soft bounces (`email.delivery_delayed`) are temporary — Resend retries automatically
   * - `email.complained` means recipient marked as spam — unsubscribe immediately
   * - `email.delivered` confirms successful delivery
   * - `email.opened`/`email.clicked` track engagement
   *
   * @see https://resend.com/docs/api-reference/webhooks
   */
  async processResendWebhook(event: ResendWebhookPayload): Promise<void> {
    const emailId = event.data?.email_id;
    if (!emailId) {
      console.warn('[Webhook] Resend event missing email_id', {
        type: event.type,
      });
      return;
    }

    console.log('[Webhook] Processing Resend event', {
      type: event.type,
      emailId,
      to: event.data?.to,
    });

    switch (event.type) {
      // ── Delivery Confirmation ─────────────────────────────────────────────
      case 'email.delivered':
        await db
          .update(messageDeliveries)
          .set({
            status: 'sent',
            payload: compactPreview({
              providerEvent: 'email.delivered',
              deliveredAt: event.data?.created_at,
            }),
            updatedAt: new Date(),
          })
          .where(eq(messageDeliveries.providerMessageId, emailId));
        break;

      // ── Hard Bounce — permanent failure, remove address ───────────────────
      case 'email.bounced':
        await db
          .update(messageDeliveries)
          .set({
            status: 'failed',
            errorMessage: event.data?.bounce?.message ?? 'Hard bounce',
            payload: compactPreview({
              providerEvent: 'email.bounced',
              bounceType: event.data?.bounce?.type,
              subject: event.data?.subject,
              to: event.data?.to,
            }),
            updatedAt: new Date(),
          })
          .where(eq(messageDeliveries.providerMessageId, emailId));

        // Hard bounces are permanent — never retry sending to this address
        for (const recipient of event.data?.to ?? []) {
          await db
            .update(users)
            .set({
              transactionalEmailOptIn: false,
              marketingEmailOptIn: false,
              updatedAt: new Date(),
            })
            .where(eq(users.email, recipient.toLowerCase()));
        }
        break;

      // ── Spam Complaint — unsubscribe immediately ──────────────────────────
      case 'email.complained':
        await db
          .update(messageDeliveries)
          .set({
            status: 'failed',
            errorMessage: 'Recipient reported spam',
            payload: compactPreview({
              providerEvent: 'email.complained',
              subject: event.data?.subject,
              to: event.data?.to,
            }),
            updatedAt: new Date(),
          })
          .where(eq(messageDeliveries.providerMessageId, emailId));

        for (const recipient of event.data?.to ?? []) {
          await db
            .update(users)
            .set({
              marketingEmailOptIn: false,
              updatedAt: new Date(),
            })
            .where(eq(users.email, recipient.toLowerCase()));
        }
        break;

      // ── Send Failure ──────────────────────────────────────────────────────
      case 'email.failed':
        await db
          .update(messageDeliveries)
          .set({
            status: 'failed',
            errorMessage: event.data?.failed?.reason ?? 'Send failed',
            payload: compactPreview({
              providerEvent: 'email.failed',
              subject: event.data?.subject,
              to: event.data?.to,
            }),
            updatedAt: new Date(),
          })
          .where(eq(messageDeliveries.providerMessageId, emailId));
        break;

      // ── Suppressed Address ────────────────────────────────────────────────
      case 'email.suppressed':
        await db
          .update(messageDeliveries)
          .set({
            status: 'failed',
            errorMessage: event.data?.suppressed?.message ?? 'Address suppressed',
            payload: compactPreview({
              providerEvent: 'email.suppressed',
              subject: event.data?.subject,
              to: event.data?.to,
            }),
            updatedAt: new Date(),
          })
          .where(eq(messageDeliveries.providerMessageId, emailId));

        for (const recipient of event.data?.to ?? []) {
          await db
            .update(users)
            .set({
              transactionalEmailOptIn: false,
              marketingEmailOptIn: false,
              updatedAt: new Date(),
            })
            .where(eq(users.email, recipient.toLowerCase()));
        }
        break;

      // ── Soft Bounce — temporary, Resend retries automatically ─────────────
      case 'email.delivery_delayed':
        await db
          .update(messageDeliveries)
          .set({
            payload: compactPreview({
              providerEvent: 'email.delivery_delayed',
              message: event.data?.delivery_delayed?.message,
              subject: event.data?.subject,
            }),
            updatedAt: new Date(),
          })
          .where(eq(messageDeliveries.providerMessageId, emailId));
        break;

      // ── Engagement Tracking ───────────────────────────────────────────────
      case 'email.opened':
        await db
          .update(messageDeliveries)
          .set({
            payload: compactPreview({
              providerEvent: 'email.opened',
              openedAt: event.data?.open?.timestamp ?? new Date().toISOString(),
            }),
            updatedAt: new Date(),
          })
          .where(eq(messageDeliveries.providerMessageId, emailId));
        break;

      case 'email.clicked':
        await db
          .update(messageDeliveries)
          .set({
            payload: compactPreview({
              providerEvent: 'email.clicked',
              link: event.data?.click?.link,
              clickedAt: event.data?.click?.timestamp ?? new Date().toISOString(),
            }),
            updatedAt: new Date(),
          })
          .where(eq(messageDeliveries.providerMessageId, emailId));
        break;

      // ── Send Accepted ─────────────────────────────────────────────────────
      case 'email.sent':
        // email.sent means the API accepted the request; delivery is not yet confirmed.
        // No status update needed — our initial status is already 'sent' (accepted).
        break;

      default:
        console.log('[Webhook] Unhandled Resend event type', {
          type: event.type,
        });
        break;
    }
  }
}
