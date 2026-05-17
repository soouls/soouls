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
import { Resend } from 'resend';
import {
  NOTIFICATION_BATCH_SIZE,
  asWhatsappRecipient,
  compactPreview,
  getBackendPublicUrl,
  getConfiguredResendSegments,
  makeAbsoluteUrl,
  normalizePhoneNumber,
  parseEnvList,
} from './notification.constants';
import {
  buildAdminInviteTemplate,
  buildCampaignTemplate,
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
  type WhatsAppMessage,
  getBrandPreset,
} from './notification.types';

type CampaignRecipient = UserMessagingProfile & {
  userIdForDelivery?: string | null;
};

type ResendWebhookPayload = {
  type?: string;
  data?: {
    email_id?: string;
    to?: string[];
    subject?: string;
    bounce?: { message?: string };
    failed?: { reason?: string };
    suppressed?: { message?: string };
  };
};

type TwilioStatusPayload = {
  MessageSid?: string;
  SmsSid?: string;
  MessageStatus?: string;
  SmsStatus?: string;
  ErrorCode?: string;
  ErrorMessage?: string;
  To?: string;
};

@Injectable()
export class NotificationDispatchService {
  private async getUserByDbId(userId: string) {
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

  private async getUserByEmail(email: string) {
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

  private async listCampaignRecipients(options: {
    channels: Channel[];
    targeting?: Record<string, string>;
  }): Promise<CampaignRecipient[]> {
    const conditions = [];

    const channelConditions = [];
    if (options.channels.includes('email')) {
      channelConditions.push(
        and(sql`${users.email} is not null`, eq(users.marketingEmailOptIn, true)),
      );
    }
    if (options.channels.includes('whatsapp')) {
      channelConditions.push(
        and(sql`${users.phoneNumber} is not null`, eq(users.marketingWhatsappOptIn, true)),
      );
    }
    if (channelConditions.length > 0) {
      conditions.push(or(...channelConditions));
    }

    if (options.targeting) {
      if (options.targeting.signupDate === 'last_7_days') {
        conditions.push(sql`${users.createdAt} > now() - interval '7 days'`);
      } else if (options.targeting.signupDate === 'last_30_days') {
        conditions.push(sql`${users.createdAt} > now() - interval '30 days'`);
      } else if (options.targeting.signupDate === 'older_than_30') {
        conditions.push(sql`${users.createdAt} < now() - interval '30 days'`);
      }

      if (options.targeting.billingTier === 'waitlist') {
        conditions.push(eq(users.isWaitlistUser, true));
      } else if (
        options.targeting.billingTier &&
        options.targeting.billingTier !== 'all' &&
        options.targeting.billingTier !== 'waitlist_all'
      ) {
        conditions.push(sql`${users.billingTier} = ${options.targeting.billingTier}`);
      }
    }

    const baseQuery = db
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
      .from(users);

    if (conditions.length > 0) {
      baseQuery.where(and(...conditions));
    }

    const signedUpRecipients = await baseQuery.orderBy(desc(users.createdAt));

    if (options.targeting?.billingTier !== 'waitlist_all') {
      return signedUpRecipients;
    }

    const allUserEmails = await db.select({ email: users.email }).from(users);
    const signedUpEmails = new Set(allUserEmails.map((user) => user.email.toLowerCase()));
    const waitlistRows = await db
      .select({
        id: waitlistUsers.id,
        email: waitlistUsers.email,
        phoneNumber: waitlistUsers.phoneNumber,
        createdAt: waitlistUsers.createdAt,
      })
      .from(waitlistUsers)
      .orderBy(desc(waitlistUsers.createdAt));

    const waitlistRecipients = waitlistRows
      .filter((entry) => !signedUpEmails.has(entry.email.toLowerCase()))
      .filter((entry) => {
        const canEmail = options.channels.includes('email') && Boolean(entry.email);
        const canWhatsapp =
          options.channels.includes('whatsapp') && Boolean(normalizePhoneNumber(entry.phoneNumber));
        return canEmail || canWhatsapp;
      })
      .map((entry) => ({
        id: entry.id,
        clerkId: `waitlist:${entry.id}`,
        email: entry.email,
        name: null,
        phoneNumber: entry.phoneNumber,
        isWaitlistUser: true,
        billingTier: 'waitlist',
        marketingEmailOptIn: true,
        marketingWhatsappOptIn: Boolean(normalizePhoneNumber(entry.phoneNumber)),
        transactionalEmailOptIn: true,
        transactionalWhatsappOptIn: Boolean(normalizePhoneNumber(entry.phoneNumber)),
        welcomeEmailSentAt: null,
        welcomeWhatsappSentAt: null,
        lastSecureAccessSentAt: null,
        userIdForDelivery: null,
      }));

    return [...signedUpRecipients, ...waitlistRecipients];
  }

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

  private getDeliveryUserId(user: CampaignRecipient) {
    return user.userIdForDelivery === null ? undefined : (user.userIdForDelivery ?? user.id);
  }

  private getResend() {
    const apiKey = process.env.RESEND_API_KEY;
    return apiKey ? new Resend(apiKey) : null;
  }

  private getNameParts(name: string | null | undefined) {
    const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
    return {
      firstName: parts[0] ?? null,
      lastName: parts.length > 1 ? parts.slice(1).join(' ') : null,
    };
  }

  private getResendSegmentIds(user: UserMessagingProfile) {
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

  private async syncResendContact(user: UserMessagingProfile) {
    const resend = this.getResend();
    if (!resend) {
      console.log('[Messaging] Resend contact sync skipped', {
        userId: user.id,
        email: user.email,
      });
      return;
    }

    const { firstName, lastName } = this.getNameParts(user.name);
    const segmentIds = this.getResendSegmentIds(user);
    const contact = {
      email: user.email,
      firstName: firstName ?? undefined,
      lastName: lastName ?? undefined,
      unsubscribed: !user.marketingEmailOptIn,
      properties: {
        userId: user.id,
        clerkId: user.clerkId,
        phoneNumber: user.phoneNumber,
        isWaitlistUser: String(Boolean(user.isWaitlistUser)),
        billingTier: user.billingTier ?? 'free',
        marketingEmailOptIn: String(user.marketingEmailOptIn),
        marketingWhatsappOptIn: String(user.marketingWhatsappOptIn),
        transactionalEmailOptIn: String(user.transactionalEmailOptIn),
        transactionalWhatsappOptIn: String(user.transactionalWhatsappOptIn),
      },
    };

    const update = await resend.contacts.update(contact);

    if (update.error) {
      const create = await resend.contacts.create({
        ...contact,
        segments: segmentIds.map((id) => ({ id })),
      });

      if (create.error) {
        throw new Error(`Resend contact sync failed: ${create.error.message}`);
      }

      return;
    }

    await Promise.all(
      segmentIds.map(async (segmentId) => {
        const result = await resend.contacts.segments.add({ email: user.email, segmentId });
        if (result.error) {
          console.warn('[Messaging] Resend segment sync failed', {
            userId: user.id,
            segmentId,
            error: result.error.message,
          });
        }
      }),
    );
  }

  private async sendEmail(message: EmailMessage): Promise<TransportResult> {
    const resend = this.getResend();
    const fromEmail = process.env.MESSAGING_FROM_EMAIL;
    const fromName = process.env.MESSAGING_FROM_NAME ?? 'Soouls';

    if (!resend || !fromEmail) {
      console.log('[Messaging] Email preview', {
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
        from: `${fromName} <${fromEmail}>`,
        to: [message.to],
        subject: message.subject,
        html: message.html,
        text: message.text,
        replyTo: process.env.MESSAGING_REPLY_TO_EMAIL || undefined,
      },
      message.idempotencyKey ? { idempotencyKey: message.idempotencyKey } : undefined,
    );

    if (response.error) {
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

  private async sendWhatsApp(message: WhatsAppMessage): Promise<TransportResult> {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_WHATSAPP_FROM;
    const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;

    if (!accountSid || !authToken || (!fromNumber && !messagingServiceSid)) {
      console.log('[Messaging] WhatsApp preview', {
        to: message.to,
        body: message.body.slice(0, 120),
        contentSid: message.contentSid,
      });

      return {
        status: 'sent',
        provider: 'dev-log',
      };
    }

    const encodedAuth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    const form = new URLSearchParams({
      To: asWhatsappRecipient(message.to),
    });

    if (messagingServiceSid) {
      form.set('MessagingServiceSid', messagingServiceSid);
    } else if (fromNumber) {
      form.set('From', asWhatsappRecipient(fromNumber));
    }

    if (message.statusCallbackUrl) {
      form.set('StatusCallback', message.statusCallbackUrl);
    }

    if (message.contentSid) {
      form.set('ContentSid', message.contentSid);
      if (message.contentVariables) {
        form.set('ContentVariables', JSON.stringify(message.contentVariables));
      }
    } else {
      form.set('Body', message.body);
    }

    const response = (await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${encodedAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: form,
      },
    )) as any;

    if (!response.ok) {
      return {
        status: 'failed',
        provider: 'twilio-whatsapp',
        errorMessage: await response.text(),
      };
    }

    const payload = (await response.json()) as { sid?: string };

    return {
      status: 'sent',
      provider: 'twilio-whatsapp',
      providerMessageId: payload.sid,
    };
  }

  private async syncNewsletterUser(user: UserMessagingProfile) {
    const url = process.env.NEWSLETTER_SYNC_URL;
    const apiKey = process.env.NEWSLETTER_SYNC_API_KEY;
    const audience = process.env.NEWSLETTER_SYNC_AUDIENCE;

    if (!url) {
      console.log('[Messaging] Newsletter sync skipped', { userId: user.id, email: user.email });
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

      const result = await this.sendEmail({
        to: user.email,
        subject: input.template.subject,
        html: input.template.html,
        text: input.template.text,
        idempotencyKey: `${input.templateKey}:email:${this.getDeliveryUserId(user) ?? user.email}:${input.campaignId ?? 'single'}`,
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

    const phoneNumber = normalizePhoneNumber(user.phoneNumber);

    if (!phoneNumber) {
      await this.recordDelivery({
        userId: this.getDeliveryUserId(user),
        campaignId: input.campaignId,
        channel: 'whatsapp',
        category: input.category,
        brandKey: input.brandKey,
        templateKey: input.templateKey,
        subject: input.template.subject,
        recipient: 'missing-whatsapp',
        provider: 'system',
        status: 'skipped',
        errorMessage: 'User has no WhatsApp-capable phone number.',
      });
      return { status: 'skipped' as const };
    }

    if (
      (!respectMarketing && !user.transactionalWhatsappOptIn) ||
      (respectMarketing && !user.marketingWhatsappOptIn)
    ) {
      await this.recordDelivery({
        userId: this.getDeliveryUserId(user),
        campaignId: input.campaignId,
        channel: 'whatsapp',
        category: input.category,
        brandKey: input.brandKey,
        templateKey: input.templateKey,
        subject: input.template.subject,
        recipient: phoneNumber,
        provider: 'system',
        status: 'skipped',
        errorMessage: 'User has opted out of this WhatsApp channel.',
      });
      return { status: 'skipped' as const };
    }

    const firstName = user.name?.split(' ')[0] || 'there';
    const statusCallbackUrl = getBackendPublicUrl()
      ? new URL('/notifications/webhooks/twilio/status', getBackendPublicUrl()).toString()
      : undefined;
    const welcomeContentSid =
      input.templateKey === 'welcome' ? process.env.TWILIO_WELCOME_TEMPLATE_SID : undefined;
    const result = await this.sendWhatsApp({
      to: phoneNumber,
      body: input.template.whatsappBody,
      contentSid: welcomeContentSid,
      contentVariables: welcomeContentSid
        ? { '1': firstName, '2': this.getDashboardUrl() }
        : undefined,
      statusCallbackUrl,
    });

    await this.recordDelivery({
      userId: this.getDeliveryUserId(user),
      campaignId: input.campaignId,
      channel: 'whatsapp',
      category: input.category,
      brandKey: input.brandKey,
      templateKey: input.templateKey,
      subject: input.template.subject,
      recipient: phoneNumber,
      provider: result.provider,
      providerMessageId: result.providerMessageId,
      status: result.status,
      errorMessage: result.errorMessage,
      payload: {
        whatsappPreview: input.template.whatsappBody.slice(0, 200),
      },
    });

    return result;
  }

  async processWelcomeSequence(userId: string) {
    const user = await this.getUserByDbId(userId);
    const template = await buildWelcomeTemplate(user);
    const failedProviders: string[] = [];

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

    if (!user.welcomeWhatsappSentAt) {
      const whatsappResult = await this.deliverTemplate({
        user,
        channel: 'whatsapp',
        category: 'transactional',
        brandKey: 'soouls',
        templateKey: 'welcome',
        template,
      });

      if (whatsappResult.status === 'sent') {
        await db
          .update(users)
          .set({
            welcomeWhatsappSentAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(users.id, user.id));
      } else if (whatsappResult.status === 'failed') {
        failedProviders.push('twilio-whatsapp');
      }
    }

    try {
      await this.syncNewsletterUser(user);
    } catch (error) {
      console.error('[Messaging] Newsletter sync failed', error);
    }

    if (failedProviders.length > 0) {
      throw new Error(`Welcome sequence failed for: ${failedProviders.join(', ')}`);
    }
  }

  async processJob(name: string, data: unknown) {
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
      case 'campaign-dispatch':
        await this.processCampaignDispatch((data as { campaignId: string }).campaignId);
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

  async processResendWebhook(event: ResendWebhookPayload) {
    const emailId = event.data?.email_id;
    if (!emailId) {
      return;
    }

    const isFailure =
      event.type === 'email.bounced' ||
      event.type === 'email.complained' ||
      event.type === 'email.failed' ||
      event.type === 'email.suppressed';
    const status = isFailure ? 'failed' : 'sent';
    const errorMessage =
      event.data?.bounce?.message ?? event.data?.failed?.reason ?? event.data?.suppressed?.message;

    await db
      .update(messageDeliveries)
      .set({
        status,
        errorMessage,
        payload: compactPreview({
          providerEvent: event.type,
          subject: event.data?.subject,
          to: event.data?.to,
        }),
        updatedAt: new Date(),
      })
      .where(eq(messageDeliveries.providerMessageId, emailId));

    if (event.type === 'email.complained' || event.type === 'email.suppressed') {
      for (const recipient of event.data?.to ?? []) {
        await db
          .update(users)
          .set({
            marketingEmailOptIn: false,
            ...(event.type === 'email.suppressed' ? { transactionalEmailOptIn: false } : {}),
            updatedAt: new Date(),
          })
          .where(eq(users.email, recipient.toLowerCase()));
      }
    }
  }

  async processTwilioStatusWebhook(payload: TwilioStatusPayload) {
    const sid = payload.MessageSid ?? payload.SmsSid;
    if (!sid) {
      return;
    }

    const providerStatus = payload.MessageStatus ?? payload.SmsStatus;
    const failed = ['failed', 'undelivered'].includes(providerStatus ?? '');

    await db
      .update(messageDeliveries)
      .set({
        status: failed ? 'failed' : 'sent',
        errorMessage: payload.ErrorMessage ?? payload.ErrorCode,
        payload: compactPreview({
          providerStatus,
          errorCode: payload.ErrorCode,
          to: payload.To,
        }),
        updatedAt: new Date(),
      })
      .where(eq(messageDeliveries.providerMessageId, sid));
  }

  private getDashboardUrl() {
    try {
      return makeAbsoluteUrl('/home');
    } catch {
      return '/home';
    }
  }

  async processSecureAccess(email: string) {
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

    await this.deliverTemplate({
      user,
      channel: 'whatsapp',
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

  async processAdminInvite(inviteId: string) {
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

  async processCampaignDispatch(campaignId: string) {
    const [campaign] = await db
      .select({
        id: messageCampaigns.id,
        brandKey: messageCampaigns.brandKey,
        subject: messageCampaigns.subject,
        markdownBody: messageCampaigns.markdownBody,
        whatsappBody: messageCampaigns.whatsappBody,
        ctaLabel: messageCampaigns.ctaLabel,
        ctaUrl: messageCampaigns.ctaUrl,
        channels: messageCampaigns.channels,
        targeting: messageCampaigns.targeting,
      })
      .from(messageCampaigns)
      .where(eq(messageCampaigns.id, campaignId))
      .limit(1);

    if (!campaign) {
      throw new Error('Campaign not found.');
    }

    const sanitizedChannels = Array.from(new Set(campaign.channels ?? [])).filter(
      (channel): channel is Channel => channel === 'email' || channel === 'whatsapp',
    );

    if (sanitizedChannels.length === 0) {
      throw new Error('Campaign has no sendable channels.');
    }

    const recipients = await this.listCampaignRecipients({
      channels: sanitizedChannels,
      targeting: campaign.targeting as Record<string, string> | undefined,
    });
    const template = buildCampaignTemplate({
      brandKey: getBrandPreset(campaign.brandKey).key,
      subject: campaign.subject,
      markdownBody: campaign.markdownBody,
      ctaLabel: campaign.ctaLabel ?? undefined,
      ctaUrl: campaign.ctaUrl ?? undefined,
      whatsappBody: campaign.whatsappBody,
    });

    let emailRecipients = 0;
    let whatsappRecipients = 0;
    let failedCount = 0;

    await db
      .update(messageCampaigns)
      .set({
        status: 'sending',
        totalRecipients: recipients.length,
        updatedAt: new Date(),
      })
      .where(eq(messageCampaigns.id, campaignId));

    for (let index = 0; index < recipients.length; index += NOTIFICATION_BATCH_SIZE) {
      const batch = recipients.slice(index, index + NOTIFICATION_BATCH_SIZE);

      await Promise.all(
        batch.flatMap((recipient) =>
          sanitizedChannels.map(async (channel) => {
            const result = await this.deliverTemplate({
              user: recipient,
              campaignId,
              channel,
              category: 'marketing',
              brandKey: getBrandPreset(campaign.brandKey).key,
              templateKey: 'campaign',
              template,
              respectMarketingPreferences: true,
            });

            if (result.status === 'sent') {
              if (channel === 'email') {
                emailRecipients += 1;
              } else {
                whatsappRecipients += 1;
              }
            }

            if (result.status === 'failed') {
              failedCount += 1;
            }
          }),
        ),
      );

      // Polite rate limit: 1 second delay between batches
      if (index + NOTIFICATION_BATCH_SIZE < recipients.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    const status: 'sent' | 'partially_sent' | 'failed' =
      failedCount === 0
        ? 'sent'
        : emailRecipients + whatsappRecipients > 0
          ? 'partially_sent'
          : 'failed';

    await db
      .update(messageCampaigns)
      .set({
        status,
        emailRecipients,
        whatsappRecipients,
        lastSentAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(messageCampaigns.id, campaignId));
  }

  async processGdprExport(userId: string, requestorEmail: string) {
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
}
