import { createClerkClient } from '@clerk/backend';
import { Inject, Injectable } from '@nestjs/common';
import { generateClusterInsights, generateHomeInsightCopy } from '@soouls/ai-engine/home-insights';
import type {
  HomeAccount,
  HomeApi,
  HomeCluster,
  HomeClusterDetail,
  HomeInsights,
  HomeSettings,
} from '@soouls/api/router';
import { and, db, desc, eq, inArray } from '@soouls/database/client';
import {
  canvasNodes,
  clusters,
  journalEntries,
  messageCampaigns,
  messageDeliveries,
  users,
} from '@soouls/database/schema';
import { EntriesService } from '../entries/entries.service';
import { RedisService } from '../redis/redis.service';
import {
  type DecodedEntryBlock,
  type DecodedHomeEntry,
  type HomeAnalyticsBundle,
  type NormalizedUserPreferences,
  type UserPreferencesInput,
  buildHomeAnalytics,
  normalizeUserPreferences,
} from './home.analytics';

type UserRow = {
  id: string;
  name: string | null;
  email: string;
  bio: string | null;
  createdAt: Date;
  themePreference: string | null;
  preferences: Record<string, unknown> | null;
  marketingEmailOptIn: boolean;
  transactionalEmailOptIn: boolean;
};

const formatRelativeUpdatedAt = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
  if (diffHours < 24) {
    return diffHours <= 1 ? '1 hour ago' : `${diffHours} hours ago`;
  }
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
};

@Injectable()
export class HomeService implements HomeApi {
  constructor(
    @Inject(EntriesService) private readonly entriesService: EntriesService,
    @Inject(RedisService) private readonly redis: RedisService,
  ) { }

  private getCacheKey(prefix: string, userId: string): string {
    return `${prefix}:${userId}`;
  }

  private async getUserRow(userId: string): Promise<UserRow> {
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        bio: users.bio,
        createdAt: users.createdAt,
        themePreference: users.themePreference,
        preferences: users.preferences,
        marketingEmailOptIn: users.marketingEmailOptIn,
        transactionalEmailOptIn: users.transactionalEmailOptIn,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  private buildSettingsFromUser(user: UserRow): NormalizedUserPreferences {
    const rawPrefs = (user.preferences ?? {}) as UserPreferencesInput;
    return normalizeUserPreferences(
      {
        ...rawPrefs,
        dailyReminder: user.transactionalEmailOptIn,
        reflectionPrompts: user.marketingEmailOptIn,
      },
      user.themePreference,
    );
  }

  private async getDecodedEntries(userId: string): Promise<DecodedHomeEntry[]> {
    const rows = await db
      .select({
        id: journalEntries.id,
        clusterId: journalEntries.clusterId,
        title: journalEntries.title,
        content: journalEntries.content,
        type: journalEntries.type,
        sentimentLabel: journalEntries.sentimentLabel,
        sentimentColor: journalEntries.sentimentColor,
        createdAt: journalEntries.createdAt,
        updatedAt: journalEntries.updatedAt,
        taskStatus: journalEntries.taskStatus,
      })
      .from(journalEntries)
      .where(eq(journalEntries.userId, userId))
      .orderBy(desc(journalEntries.createdAt));

    return rows.map((row) => {
      const decoded = this.entriesService.decodeEntryContent(row.content, userId);

      return {
        id: row.id,
        clusterId: row.clusterId,
        title: row.title,
        text: decoded.text,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        type: row.type,
        sentimentLabel: row.sentimentLabel,
        sentimentColor: row.sentimentColor,
        taskStatus: row.taskStatus,
        blocks: Array.isArray(decoded.full?.blocks)
          ? (decoded.full.blocks as DecodedEntryBlock[])
          : [],
      };
    });
  }

  private async enrichAnalyticsWithAiCopy(
    analytics: HomeAnalyticsBundle,
    userName: string,
    entries: DecodedHomeEntry[],
  ): Promise<HomeAnalyticsBundle> {
    const aiCopy = await generateHomeInsightCopy({
      userName,
      topThemes: analytics.insights.thoughtThemes.map((theme) => theme.label),
      entriesText: entries.slice(0, 5).map((e) => e.text),
      monthlyNarrativeFallback: analytics.insights.monthlyNarrative,
      finalSynthesisFallback: analytics.insights.finalSynthesis,
      writingProfileTitleFallback: analytics.account.writingProfile.title,
      writingProfileDescriptionFallback: analytics.account.writingProfile.description,
    });

    if (!aiCopy) {
      return analytics;
    }

    return {
      ...analytics,
      insights: {
        ...analytics.insights,
        monthlyNarrative: aiCopy.monthlyNarrative,
        finalSynthesis: aiCopy.finalSynthesis,
      },
      account: {
        ...analytics.account,
        writingProfile: {
          ...analytics.account.writingProfile,
          title: aiCopy.writingProfileTitle,
          description: aiCopy.writingProfileDescription,
        },
      },
    };
  }

  private async getSnapshot(userId: string): Promise<{
    user: UserRow;
    settings: NormalizedUserPreferences;
    analytics: ReturnType<typeof buildHomeAnalytics>;
  }> {
    const cacheKey = this.getCacheKey('home:snapshot', userId);
    const cached = await this.redis.get<{
      user: UserRow;
      settings: NormalizedUserPreferences;
      analytics: ReturnType<typeof buildHomeAnalytics>;
    }>(cacheKey);

    if (cached) {
      return cached;
    }

    const user = await this.getUserRow(userId);
    const settings = this.buildSettingsFromUser(user);
    const entries = await this.getDecodedEntries(userId);
    const baseAnalytics = buildHomeAnalytics({
      entries,
      preferences: settings,
      userName: user.name ?? 'Explorer',
      now: new Date(),
    });
    const analytics = await this.enrichAnalyticsWithAiCopy(
      baseAnalytics,
      user.name ?? 'Explorer',
      entries,
    );

    const snapshot = {
      user,
      settings,
      analytics,
    };

    await this.redis.set(cacheKey, snapshot, 300);
    return snapshot;
  }

  async getInsights(userId: string): Promise<HomeInsights> {
    const { analytics } = await this.getSnapshot(userId);

    return {
      overview: analytics.overview,
      monthlyNarrative: analytics.insights.monthlyNarrative,
      thoughtThemes: analytics.insights.thoughtThemes.map((theme) => ({
        key: theme.key,
        label: theme.label,
        count: theme.count,
        progress: theme.progress,
      })),
      finalSynthesis: analytics.insights.finalSynthesis,
      clustersHeadline: analytics.clusters.headline,
      clusters: analytics.clusters.items,
      canvasFolders: analytics.canvas.folders,
      coreThemes: analytics.account.coreThemes,
      writingProfile: analytics.account.writingProfile,
    };
  }

  async getAccount(userId: string): Promise<HomeAccount> {
    const { analytics, user } = await this.getSnapshot(userId);
    const daysJoined = Math.max(
      1,
      Math.ceil((Date.now() - new Date(user.createdAt).getTime()) / (24 * 60 * 60 * 1000)),
    );

    return {
      stats: {
        daysJoined,
        entries: analytics.overview.entryCount,
        streak: analytics.overview.currentStreak,
        mostActivePeriod: analytics.overview.mostActivePeriod,
      },
      writingProfile: analytics.account.writingProfile,
      coreThemes: analytics.account.coreThemes,
      consistencyMessage:
        analytics.overview.currentStreak >= 3
          ? "You've been staying consistent."
          : 'Your reflective rhythm is starting to form.',
      bio: user.bio ?? 'Trying to make sense of my thoughts.',
    };
  }

  async getSettings(userId: string): Promise<HomeSettings> {
    const { settings } = await this.getSnapshot(userId);
    return settings;
  }

  async updateSettings(userId: string, input: Partial<HomeSettings>): Promise<HomeSettings> {
    const user = await this.getUserRow(userId);
    const current = this.buildSettingsFromUser(user);
    const next = normalizeUserPreferences(
      {
        ...current,
        ...input,
      },
      input.accentTheme ?? user.themePreference,
    );

    await db
      .update(users)
      .set({
        themePreference: next.accentTheme,
        preferences: next as unknown as Record<string, unknown>,
        marketingEmailOptIn: next.reflectionPrompts,
        transactionalEmailOptIn: next.dailyReminder,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    await this.redis.invalidatePattern(`home:*:${userId}*`);

    return next;
  }

  async getClusters(userId: string): Promise<{
    headline: string;
    items: HomeCluster[];
    folders: Array<{ id: string; title: string; entryCount: number; updatedAtLabel: string }>;
  }> {
    const { analytics } = await this.getSnapshot(userId);
    const userFolders = await db
      .select({
        id: clusters.id,
        title: clusters.name,
        description: clusters.description,
        updatedAt: clusters.updatedAt,
      })
      .from(clusters)
      .where(eq(clusters.userId, userId))
      .orderBy(desc(clusters.updatedAt));

    const decodedEntries = await this.getDecodedEntries(userId);
    await this.ensureReliableClusters(userId, analytics.clusters.items, decodedEntries);

    const userFoldersAfterPromotion = await db
      .select({
        id: clusters.id,
        title: clusters.name,
        description: clusters.description,
        updatedAt: clusters.updatedAt,
      })
      .from(clusters)
      .where(eq(clusters.userId, userId))
      .orderBy(desc(clusters.updatedAt));

    const entries = await db
      .select({
        clusterId: journalEntries.clusterId,
      })
      .from(journalEntries)
      .where(eq(journalEntries.userId, userId));
    const entryCounts = new Map<string, number>();
    for (const row of entries) {
      if (!row.clusterId) continue;
      entryCounts.set(row.clusterId, (entryCounts.get(row.clusterId) ?? 0) + 1);
    }

    return {
      headline: analytics.clusters.headline,
      items:
        userFoldersAfterPromotion.length > 0
          ? userFoldersAfterPromotion.map((folder, index) => {
              const analyticsMatch = analytics.clusters.items.find(
                (item) => item.name.toLowerCase() === folder.title.toLowerCase(),
              );
              return {
                id: folder.id,
                name: folder.title,
                entryCount: entryCounts.get(folder.id) ?? analyticsMatch?.entryCount ?? 0,
                updatedAtLabel: formatRelativeUpdatedAt(folder.updatedAt),
                description:
                  folder.description ??
                  analyticsMatch?.description ??
                  'A stable space formed from recurring patterns in your entries.',
                strength: index === 0 ? 'Dominant' : (analyticsMatch?.strength ?? 'Emerging'),
                tones: analyticsMatch?.tones ?? ['Reflective', 'Focused'],
              };
            })
          : analytics.clusters.items,
      folders:
        userFoldersAfterPromotion.length > 0
          ? userFoldersAfterPromotion.map((folder) => ({
              id: folder.id,
              title: folder.title,
              entryCount: entryCounts.get(folder.id) ?? 0,
              updatedAtLabel: formatRelativeUpdatedAt(folder.updatedAt),
            }))
          : analytics.canvas.folders,
    };
  }

  /**
   * Promotes AI-suggested clusters to stable, database-backed folders
   * and automatically assigns matching entries to them.
   */
  private async ensureReliableClusters(
    userId: string,
    suggestedClusters: any[],
    entries: DecodedHomeEntry[],
  ): Promise<void> {
    // Promote clusters that have at least 1 entry
    const robustClusters = suggestedClusters.filter((c) => c.entryCount >= 1);

    for (const cluster of robustClusters) {
      // Avoid promoting 'Recent Entries' if we already have specific thematic folders
      // Unless it's the ONLY cluster available
      if (cluster.name === 'Recent Entries' && robustClusters.length > 1) {
        continue;
      }

      // Check if this cluster already exists as a stable folder
      const [existing] = await db
        .select()
        .from(clusters)
        .where(and(eq(clusters.userId, userId), eq(clusters.name, cluster.name)))
        .limit(1);

      let clusterId = existing?.id;

      if (!existing) {
        // Create the folder if it doesn't exist
        const [created] = await db
          .insert(clusters)
          .values({
            userId,
            name: cluster.name,
            description: cluster.description || 'A space for your recent thoughts and explorations.',
          })
          .returning({ id: clusters.id });
        clusterId = created.id;
      }

      // Assign matching entries to this cluster if they don't have one yet
      const matchWords = (cluster.name === 'Recent Entries') 
        ? [] // Match all entries if it's the generic folder
        : cluster.name
          .toLowerCase()
          .split(/[^a-z0-9]+/g)
          .filter(Boolean);

      for (const entry of entries) {
        // If entry is already in a different cluster, skip it
        if (entry.clusterId) continue;

        let matches = false;
        if (cluster.name === 'Recent Entries') {
          matches = true; // Generic match
        } else {
          const corpus = `${entry.title ?? ''} ${entry.text}`.toLowerCase();
          matches = matchWords.some((word) => corpus.includes(word));
        }

        if (matches) {
          await db
            .update(journalEntries)
            .set({ clusterId, updatedAt: new Date() })
            .where(eq(journalEntries.id, entry.id));
          
          // Update the local entry object so it doesn't get assigned to multiple clusters in this loop
          entry.clusterId = clusterId;
        }
      }
    }
  }

  async createFolder(userId: string, input: { name?: string }) {
    const { analytics } = await this.getSnapshot(userId);
    const suggestedName = analytics.clusters.items[0]?.name ?? 'New Space';
    const folderName = input.name?.trim() || suggestedName;
    const [created] = await db
      .insert(clusters)
      .values({
        userId,
        name: folderName,
        description: 'A custom space created for manual organization.',
      })
      .returning({
        id: clusters.id,
        title: clusters.name,
        updatedAt: clusters.updatedAt,
      });

    await this.redis.invalidatePattern(`home:*:${userId}*`);
    return {
      id: created.id,
      title: created.title,
      entryCount: 0,
      updatedAtLabel: formatRelativeUpdatedAt(created.updatedAt),
    };
  }

  async deleteFolder(userId: string, folderId: string): Promise<{ deleted: true }> {
    await db
      .update(journalEntries)
      .set({ clusterId: null, updatedAt: new Date() })
      .where(and(eq(journalEntries.clusterId, folderId), eq(journalEntries.userId, userId)));
    await db
      .delete(clusters)
      .where(and(eq(clusters.id, folderId), eq(clusters.userId, userId)));
    await this.redis.invalidatePattern(`home:*:${userId}*`);
    return { deleted: true };
  }

  async getClusterDetail(userId: string, clusterId: string): Promise<HomeClusterDetail | null> {
    const { analytics } = await this.getSnapshot(userId);
    const entries = await this.getDecodedEntries(userId);
    const dbCluster = await db
      .select({
        id: clusters.id,
        name: clusters.name,
        description: clusters.description,
      })
      .from(clusters)
      .where(eq(clusters.id, clusterId))
      .limit(1);

    const cluster =
      analytics.clusters.items.find((item) => item.id === clusterId) ??
      (dbCluster[0]
        ? ({
            id: dbCluster[0].id,
            name: dbCluster[0].name,
            entryCount: 0,
            updatedAtLabel: 'Recently',
            description: dbCluster[0].description ?? 'Your custom folder for related entries.',
            strength: 'Emerging',
            tones: ['Reflective'],
          } as HomeCluster)
        : null);

    if (!cluster) {
      return null;
    }

    const matchWords = cluster.name
      .toLowerCase()
      .split(/[^a-z0-9]+/g)
      .map((word) => word.trim())
      .filter(Boolean);

    const matchingEntries = dbCluster[0]
      ? entries.filter((entry) => entry.clusterId === clusterId)
      : cluster.id.startsWith('recent-entries')
        ? entries
        : entries.filter((entry) => {
            const corpus = `${entry.title ?? ''} ${entry.text}`.toLowerCase();
            return matchWords.some((word) => corpus.includes(word));
          });

    const highlights = matchingEntries.slice(0, 3).map((entry) => ({
      id: entry.id,
      title: entry.title || entry.text.split('\n')[0] || 'Untitled entry',
      type: entry.type,
      createdAt: entry.createdAt.toISOString(),
    }));

    const topWords = matchingEntries
      .flatMap((entry) => entry.text.toLowerCase().split(/[^a-z0-9]+/g))
      .filter((word) => word.length > 4)
      .slice(0, 6);

    const keyIdeas = (topWords.length > 0 ? topWords : cluster.name.split(' '))
      .slice(0, 3)
      .map((word) => ({
        label: word.replace(/^\w/, (char) => char.toUpperCase()),
        description: `This idea appears repeatedly inside the ${cluster.name.toLowerCase()} cluster.`,
      }));

    const aiInsights = await generateClusterInsights({
      clusterName: cluster.name,
      entriesText: matchingEntries.slice(0, 5).map((e) => e.text),
    });

    return {
      cluster,
      narrative:
        aiInsights?.narrative ||
        `Your recent entries in ${cluster.name.toLowerCase()} are becoming more coherent. The signal here is stronger than the noise, and the next step is easier to see.`,
      keyIdeas: (aiInsights?.keyIdeas?.length ? aiInsights.keyIdeas : keyIdeas) as {
        label: string;
        description: string;
      }[],
      highlights,
      observation:
        aiInsights?.observation ||
        `A clear pattern is emerging around ${cluster.name.toLowerCase()}. Your entries are becoming more specific and action-oriented over time.`,
      nextStep:
        aiInsights?.nextStep ||
        `Capture one more concrete entry that moves ${cluster.name.toLowerCase()} from reflection into action.`,
      reflectionPrompt:
        aiInsights?.reflectionPrompt ||
        `If you had to explain why ${cluster.name.toLowerCase()} matters right now, what truth would you be least comfortable saying out loud?`,
    };
  }

  async deleteAccount(userId: string): Promise<{ deleted: true }> {
    const [user] = await db
      .select({ id: users.id, clerkId: users.clerkId })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new Error('User not found');
    }

    const entryIds = await db
      .select({ id: journalEntries.id })
      .from(journalEntries)
      .where(eq(journalEntries.userId, userId));

    if (entryIds.length > 0) {
      await db.delete(canvasNodes).where(
        inArray(
          canvasNodes.entryId,
          entryIds.map((entry) => entry.id),
        ),
      );
    }

    await db.delete(messageDeliveries).where(eq(messageDeliveries.userId, userId));
    await db.delete(messageCampaigns).where(eq(messageCampaigns.createdByUserId, userId));
    await db.delete(journalEntries).where(eq(journalEntries.userId, userId));
    await db.delete(users).where(eq(users.id, userId));

    const secretKey = process.env.CLERK_SECRET_KEY;
    if (secretKey) {
      const clerk = createClerkClient({ secretKey });
      await clerk.users.deleteUser(user.clerkId);
    }

    await this.redis.invalidatePattern(`home:*:${userId}*`);
    await this.redis.invalidatePattern(`entries:all:${userId}:*`);
    await this.redis.invalidatePattern(`galaxy:${userId}:*`);

    return { deleted: true };
  }
}
