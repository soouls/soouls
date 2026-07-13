import { Inject, Injectable } from '@nestjs/common';
import { and, db, desc, eq, or, sql } from '@soouls/database/client';
import { messageCampaigns, messageDeliveries, users, waitlistUsers } from '@soouls/database/schema';
import { Resend } from 'resend';
// biome-ignore lint/style/useImportType: Nest uses this class as a runtime injection token.
import { NotificationDispatchService } from '../notifications/notification-dispatch.service';
import {
  countValue,
  normalizePhoneNumber,
  parseEnvList,
} from '../notifications/notification.constants';
// biome-ignore lint/style/useImportType: Nest uses this class as a runtime injection token.
import { NotificationQueueService } from '../notifications/notification.queue';
import {
  BRAND_PRESETS,
  type CampaignInput,
  type Channel,
  type PreferencesInput,
  type UserMessagingProfile,
  getBrandPreset,
} from '../notifications/notification.types';
// biome-ignore lint/style/useImportType: Nest uses this class as a runtime injection token.
import { RedisService } from '../redis/redis.service';

type BrandKey = 'soouls' | 'soouls-studio' | 'founder-desk';
type CampaignStatus = 'draft' | 'sending' | 'sent' | 'partially_sent' | 'failed';
type DeliveryCategory = 'transactional' | 'marketing' | 'security' | 'product';
type DeliveryStatus = 'pending' | 'sent' | 'failed' | 'skipped';

interface CampaignRecord {
  id: string;
  brandKey: BrandKey;
  title: string;
  subject: string;
  status: CampaignStatus;
  channels: Channel[];
  totalRecipients: number;
  emailRecipients: number;
  whatsappRecipients: number;
  lastSentAt: Date | null;
  createdAt: Date;
}

interface DeliveryRecord {
  id: string;
  brandKey: BrandKey;
  channel: Channel;
  category: DeliveryCategory;
  templateKey: string;
  status: DeliveryStatus;
  recipient: string;
  subject: string | null;
  provider: string;
  createdAt: Date;
}

export interface CachedCenterData {
  providerHealth: {
    emailConfigured: boolean;
    whatsappConfigured: boolean;
    queueConfigured: boolean;
    newsletterConfigured: boolean;
    commandCenterConfigured: boolean;
  };
  queue: { waiting: number; active: number; delayed: number; failed: number };
  stats: {
    totalUsers: number;
    emailReachable: number;
    whatsappReachable: number;
    waitlistReachable: number;
    campaignsSent: number;
  };
  brands: Array<{ key: string; label: string; eyebrow: string }>;
  campaigns: CampaignRecord[];
  recentDeliveries: DeliveryRecord[];
  templates: Array<{ key: string; label: string; description: string }>;
}

type UserCenterResponse = {
  viewer: {
    email: string;
    name: string | null;
    canManageCampaigns: boolean;
  };
  preferences: {
    phoneNumber: string | null;
    marketingEmailOptIn: boolean;
    marketingWhatsappOptIn: boolean;
    transactionalEmailOptIn: boolean;
    transactionalWhatsappOptIn: boolean;
    welcomeEmailSentAt: Date | null;
    welcomeWhatsappSentAt: Date | null;
    lastSecureAccessSentAt: Date | null;
  };
  providerHealth: {
    emailConfigured: boolean;
    whatsappConfigured: boolean;
    queueConfigured: boolean;
    newsletterConfigured: boolean;
    commandCenterConfigured: boolean;
  };
  templates: Array<{ key: string; label: string; description: string }>;
  stats: {
    totalUsers: number;
    emailReachable: number;
    whatsappReachable: number;
    waitlistReachable: number;
    campaignsSent: number;
  } | null;
  brands: Array<{ key: string; label: string; eyebrow: string }>;
  campaigns: CampaignRecord[];
  recentDeliveries: DeliveryRecord[];
};

@Injectable()
export class MessagingService {
  private readonly adminEmails = parseEnvList(process.env.MESSAGING_ADMIN_EMAILS);
  private readonly adminClerkIds = parseEnvList(process.env.MESSAGING_ADMIN_CLERK_IDS);
  private readonly CACHE_TTL = {
    ADMIN_CENTER: 120,
    USER_CENTER: 300,
  };

  constructor(
    private readonly notificationQueue: NotificationQueueService,
    private readonly notificationDispatch: NotificationDispatchService,
    private readonly redis: RedisService,
  ) {}

  private isAdmin(user: Pick<UserMessagingProfile, 'email' | 'clerkId'>) {
    if (process.env.NODE_ENV !== 'production') {
      return true;
    }

    return (
      this.adminEmails.has(user.email.toLowerCase()) ||
      this.adminClerkIds.has(user.clerkId.toLowerCase())
    );
  }

  private getProviderHealth() {
    return {
      emailConfigured: Boolean(process.env.RESEND_API_KEY && process.env.MESSAGING_FROM_EMAIL),
      whatsappConfigured: false,
      queueConfigured: this.notificationQueue.isConfigured(),
      newsletterConfigured: Boolean(process.env.NEWSLETTER_SYNC_URL),
      commandCenterConfigured: Boolean(
        process.env.CLERK_SECRET_KEY && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      ),
    };
  }

  private async getUserByDbId(userId: string) {
    const [user] = await db
      .select({
        id: users.id,
        clerkId: users.clerkId,
        email: users.email,
        name: users.name,
        phoneNumber: users.phoneNumber,
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

  private async buildCenterData(): Promise<CachedCenterData> {
    const cacheKey = 'messaging:admin:center';
    const cached = await this.redis.get<CachedCenterData>(cacheKey);
    if (cached) return cached;

    const [usersCountRow] = await db.select({ count: sql<number>`count(*)` }).from(users);
    const [emailReachableRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(sql`${users.email} is not null`);
    const [waitlistReachableRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(waitlistUsers);

    const campaigns = (
      await db
        .select({
          id: messageCampaigns.id,
          brandKey: messageCampaigns.brandKey,
          title: messageCampaigns.title,
          subject: messageCampaigns.subject,
          status: messageCampaigns.status,
          channels: messageCampaigns.channels,
          totalRecipients: messageCampaigns.totalRecipients,
          emailRecipients: messageCampaigns.emailRecipients,
          whatsappRecipients: messageCampaigns.whatsappRecipients,
          lastSentAt: messageCampaigns.lastSentAt,
          createdAt: messageCampaigns.createdAt,
        })
        .from(messageCampaigns)
        .orderBy(desc(messageCampaigns.createdAt))
        .limit(8)
    ).map((campaign) => ({
      ...campaign,
      brandKey: getBrandPreset(campaign.brandKey).key,
    }));

    const recentDeliveries = (
      await db
        .select({
          id: messageDeliveries.id,
          brandKey: messageDeliveries.brandKey,
          channel: messageDeliveries.channel,
          category: messageDeliveries.category,
          templateKey: messageDeliveries.templateKey,
          status: messageDeliveries.status,
          recipient: messageDeliveries.recipient,
          subject: messageDeliveries.subject,
          provider: messageDeliveries.provider,
          createdAt: messageDeliveries.createdAt,
        })
        .from(messageDeliveries)
        .orderBy(desc(messageDeliveries.createdAt))
        .limit(12)
    ).map((delivery) => ({
      ...delivery,
      brandKey: getBrandPreset(delivery.brandKey).key,
    }));

    const queue = await this.notificationQueue.getCounts();

    const result: CachedCenterData = {
      providerHealth: this.getProviderHealth(),
      queue,
      stats: {
        totalUsers: countValue(usersCountRow?.count),
        emailReachable: countValue(emailReachableRow?.count),
        whatsappReachable: 0,
        waitlistReachable: countValue(waitlistReachableRow?.count),
        campaignsSent: campaigns.length,
      },
      brands: Object.values(BRAND_PRESETS).map((brand) => ({
        key: brand.key,
        label: brand.label,
        eyebrow: brand.eyebrow,
      })),
      campaigns,
      recentDeliveries,
      templates: [
        {
          key: 'welcome',
          label: 'Welcome',
          description: 'Queued after signup, then sent by the notification worker.',
        },
        {
          key: 'secure-access',
          label: 'Secure Access',
          description: 'Magic-link recovery sent by the background worker.',
        },
        {
          key: 'campaign',
          label: 'Campaign',
          description: 'Markdown-powered release, product, and launch announcements.',
        },
      ],
    };

    await this.redis.set(cacheKey, result, this.CACHE_TTL.ADMIN_CENTER);
    return result;
  }

  private async queueCampaign(_input: CampaignInput, _createdByUserId?: string | null) {
    throw new Error(
      'Campaigns are now managed directly in the Resend Dashboard. Please use Resend Broadcasts instead.',
    );
    // biome-ignore lint/correctness/noUnreachable: Stub return for types
    return {
      campaignId: 'stub',
      status: 'queued' as const,
      totalRecipients: 0,
      emailRecipients: 0,
      whatsappRecipients: 0,
      failedCount: 0,
    };
  }

  async sendWelcomeSequence(userId: string) {
    if (!this.notificationQueue.isConfigured()) {
      await this.notificationDispatch.processWelcomeSequence(userId);
      return;
    }

    try {
      await this.notificationQueue.enqueueWelcomeSequence(userId);
    } catch (error) {
      console.error('[Messaging] Failed to enqueue welcome sequence', { userId, error });
      await this.notificationDispatch.processWelcomeSequence(userId);
    }
  }

  async requestSecureAccessLink(email: string) {
    const normalizedEmail = email.trim().toLowerCase();
    if (!this.notificationQueue.isConfigured()) {
      await this.notificationDispatch.processSecureAccess(normalizedEmail);
      return { accepted: true };
    }

    try {
      await this.notificationQueue.enqueueSecureAccess(normalizedEmail);
    } catch (error) {
      console.error('[Messaging] Failed to enqueue secure access email', {
        email: normalizedEmail,
        error,
      });
      await this.notificationDispatch.processSecureAccess(normalizedEmail);
    }
    return { accepted: true };
  }

  async getCenter(userId: string): Promise<UserCenterResponse> {
    const cacheKey = `messaging:center:${userId}`;
    const viewer = await this.getUserByDbId(userId);
    const canManageCampaigns = this.isAdmin(viewer);

    if (!canManageCampaigns) {
      const cachedResponse = await this.redis.get<UserCenterResponse>(cacheKey);
      if (cachedResponse) return cachedResponse;

      const response: UserCenterResponse = {
        viewer: {
          email: viewer.email,
          name: viewer.name,
          canManageCampaigns,
        },
        preferences: {
          phoneNumber: viewer.phoneNumber,
          marketingEmailOptIn: viewer.marketingEmailOptIn,
          marketingWhatsappOptIn: viewer.marketingWhatsappOptIn,
          transactionalEmailOptIn: viewer.transactionalEmailOptIn,
          transactionalWhatsappOptIn: viewer.transactionalWhatsappOptIn,
          welcomeEmailSentAt: viewer.welcomeEmailSentAt,
          welcomeWhatsappSentAt: viewer.welcomeWhatsappSentAt,
          lastSecureAccessSentAt: viewer.lastSecureAccessSentAt,
        },
        providerHealth: this.getProviderHealth(),
        templates: [
          {
            key: 'welcome',
            label: 'Welcome',
            description: 'Sent the first time a Soouls user is synced into the product.',
          },
          {
            key: 'secure-access',
            label: 'Secure Access',
            description: 'Recovery email that helps a user re-enter safely.',
          },
          {
            key: 'campaign',
            label: 'Campaign',
            description: 'Broadcast updates to everyone in the messaging system.',
          },
        ],
        stats: null,
        brands: Object.values(BRAND_PRESETS).map((brand) => ({
          key: brand.key,
          label: brand.label,
          eyebrow: brand.eyebrow,
        })),
        campaigns: [],
        recentDeliveries: [],
      };

      await this.redis.set(cacheKey, response, this.CACHE_TTL.USER_CENTER);
      return response;
    }

    const center = await this.buildCenterData();

    return {
      viewer: {
        email: viewer.email,
        name: viewer.name,
        canManageCampaigns,
      },
      preferences: {
        phoneNumber: viewer.phoneNumber,
        marketingEmailOptIn: viewer.marketingEmailOptIn,
        marketingWhatsappOptIn: viewer.marketingWhatsappOptIn,
        transactionalEmailOptIn: viewer.transactionalEmailOptIn,
        transactionalWhatsappOptIn: viewer.transactionalWhatsappOptIn,
        welcomeEmailSentAt: viewer.welcomeEmailSentAt,
        welcomeWhatsappSentAt: viewer.welcomeWhatsappSentAt,
        lastSecureAccessSentAt: viewer.lastSecureAccessSentAt,
      },
      ...center,
    };
  }

  async getAdminCenter() {
    return this.buildCenterData();
  }

  async updatePreferences(userId: string, input: PreferencesInput) {
    const [updated] = await db
      .update(users)
      .set({
        phoneNumber: normalizePhoneNumber(input.phoneNumber),
        marketingEmailOptIn: input.marketingEmailOptIn,
        marketingWhatsappOptIn: input.marketingWhatsappOptIn,
        transactionalEmailOptIn: input.transactionalEmailOptIn,
        transactionalWhatsappOptIn: input.transactionalWhatsappOptIn,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning({
        phoneNumber: users.phoneNumber,
        marketingEmailOptIn: users.marketingEmailOptIn,
        marketingWhatsappOptIn: users.marketingWhatsappOptIn,
        transactionalEmailOptIn: users.transactionalEmailOptIn,
        transactionalWhatsappOptIn: users.transactionalWhatsappOptIn,
        welcomeEmailSentAt: users.welcomeEmailSentAt,
        welcomeWhatsappSentAt: users.welcomeWhatsappSentAt,
        lastSecureAccessSentAt: users.lastSecureAccessSentAt,
      });

    await this.redis.del(`messaging:center:${userId}`);
    await this.redis.del('messaging:admin:center');

    void this.syncSignupContact(userId).catch((error) => {
      console.error('[Messaging] Resend contact sync after preference update failed', {
        userId,
        error,
      });
    });

    return updated;
  }

  async syncSignupContact(userId: string, options: { triggerSignupEvent?: boolean } = {}) {
    await this.notificationDispatch.syncResendContactByUserId(userId, options);
  }

  async sendCampaign(userId: string, input: CampaignInput) {
    const sender = await this.getUserByDbId(userId);
    if (!this.isAdmin(sender)) {
      throw new Error('You are not allowed to send campaigns.');
    }

    return this.queueCampaign(input, sender.id);
  }

  async sendTestEmail(_input: {
    to: string;
    subject: string;
    markdownBody: string;
    ctaLabel?: string;
    ctaUrl?: string;
    brandKey?: 'soouls' | 'soouls-studio' | 'founder-desk';
  }) {
    throw new Error('Test emails are now managed and sent directly from the Resend Dashboard.');
    // biome-ignore lint/correctness/noUnreachable: Stub return for types
    return {
      deliveryId: 'stub',
      status: 'sent',
      provider: 'resend',
      messageId: 'stub',
    };
  }

  async createAdminCampaign(input: CampaignInput) {
    return this.queueCampaign(input, null);
  }
}
