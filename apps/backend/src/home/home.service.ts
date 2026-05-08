import { createClerkClient } from '@clerk/backend';
import { Inject, Injectable } from '@nestjs/common';
import {
  type InsightEntryMeta,
  generateClusterInsights,
  generateEntryCanvas,
  generateEntryClusters,
  generateHomeInsightCopy,
} from '@soouls/ai-engine/home-insights';
import type {
  AccountExport,
  EntryCanvas,
  EntryCanvasCard,
  EntryCanvasConnection,
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
  entryCanvases,
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
  isWaitlistUser: boolean;
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

const normalizeRouteSegment = (value: string): string =>
  decodeURIComponent(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

@Injectable()
export class HomeService implements HomeApi {
  constructor(
    @Inject(EntriesService) private readonly entriesService: EntriesService,
    @Inject(RedisService) private readonly redis: RedisService,
  ) {}

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
        isWaitlistUser: users.isWaitlistUser,
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
    // Don't call AI if there are zero entries
    if (entries.length === 0) {
      return analytics;
    }

    // Build full entry metadata for the AI — up to 50 entries with timestamps and word counts
    const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const entryMetas: InsightEntryMeta[] = entries.slice(0, 50).map((e) => ({
      text: e.text,
      timestamp: e.createdAt.toISOString(),
      wordCount: e.text.split(/\s+/).filter(Boolean).length,
      dayOfWeek: DAYS[e.createdAt.getUTCDay()] ?? 'Unknown',
      hourOfDay: e.createdAt.getUTCHours(),
    }));

    // Calculate date range from actual entries
    const sorted = [...entries].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    const dateRangeStart = sorted[0]?.createdAt.toISOString().slice(0, 10) ?? '';
    const dateRangeEnd = sorted[sorted.length - 1]?.createdAt.toISOString().slice(0, 10) ?? '';

    const aiCopy = await generateHomeInsightCopy({
      userName,
      topThemes: analytics.insights.thoughtThemes.map((theme) => theme.label),
      entries: entryMetas,
      totalEntryCount: entries.length,
      dateRangeStart,
      dateRangeEnd,
      peakWritingTime: analytics.overview.mostActivePeriod,
      weeklyEntryCount: analytics.overview.weeklyEntryCount,
      previousWeeklyEntryCount: Math.max(0, analytics.overview.weeklyEntryCount - 1),
      currentStreak: analytics.overview.currentStreak,
      monthlyQuoteFallback: analytics.insights.monthlyQuote,
      monthlyAnalysisFallback: analytics.insights.monthlyAnalysis,
      finalSynthesisFallback: analytics.insights.finalSynthesis.headline,
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
        monthlyQuote: aiCopy.monthlyQuote,
        monthlyAnalysis: aiCopy.monthlyAnalysis,
        statLine: aiCopy.statLine || analytics.insights.statLine,
        statNote: aiCopy.statNote || analytics.insights.statNote,
        dominantTheme: aiCopy.dominantTheme || analytics.insights.dominantTheme,
        previousTheme: aiCopy.previousTheme || analytics.insights.previousTheme,
        thoughtThemes: aiCopy.thoughtThemes?.length
          ? aiCopy.thoughtThemes.map((theme) => ({
              key: theme.label
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, ''),
              label: theme.label,
              clusterDescription: `Entries connected to ${theme.label.toLowerCase()}.`,
              keywords: [],
              count: Math.max(1, Math.round(theme.count)),
              progress: Math.max(1, Math.min(100, Math.round(theme.percentage))),
            }))
          : analytics.insights.thoughtThemes,
        finalSynthesis: {
          headline: aiCopy.finalSynthesis.headline || analytics.insights.finalSynthesis.headline,
          body: aiCopy.finalSynthesis.body || analytics.insights.finalSynthesis.body,
        },
        reflectionToneDescription:
          aiCopy.reflectionToneDescription || analytics.insights.reflectionToneDescription,
        relationshipMap: aiCopy.relationshipMap?.nodes?.length
          ? (aiCopy.relationshipMap as {
              nodes: { id: string; label: string; size: number }[];
              links: { source: string; target: string; strength: number }[];
            })
          : analytics.insights.relationshipMap,
        thinkingShifts: aiCopy.thinkingShifts?.length
          ? (aiCopy.thinkingShifts as {
              label: string;
              trend: 'up' | 'down' | 'circle' | null;
              tag: string | null;
            }[])
          : analytics.insights.thinkingShifts,
      },
      account: {
        ...analytics.account,
        coreThemes: aiCopy.coreThemes?.length
          ? (aiCopy.coreThemes as { label: string; percent: number }[])
          : analytics.account.coreThemes,
        writingProfile: {
          ...analytics.account.writingProfile,
          title: aiCopy.writingProfileTitle || analytics.account.writingProfile.title,
          description:
            aiCopy.writingProfileDescription || analytics.account.writingProfile.description,
          tags: aiCopy.writingProfileTags?.length
            ? aiCopy.writingProfileTags
            : analytics.account.writingProfile.tags,
        },
      },
    };
  }

  private async getSnapshot(userId: string): Promise<{
    user: UserRow;
    settings: NormalizedUserPreferences;
    analytics: ReturnType<typeof buildHomeAnalytics>;
    lastUpdated: string;
  }> {
    const monthKey = new Date().toISOString().slice(0, 7);
    const cacheKey = `${this.getCacheKey('home:snapshot:v5', userId)}:${monthKey}`;
    const cached = await this.redis.get<{
      user: UserRow;
      settings: NormalizedUserPreferences;
      analytics: ReturnType<typeof buildHomeAnalytics>;
      lastUpdated: string;
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

    let analytics: HomeAnalyticsBundle;
    try {
      analytics = await Promise.race([
        this.enrichAnalyticsWithAiCopy(baseAnalytics, user.name ?? 'Explorer', entries),
        new Promise<HomeAnalyticsBundle>((_, reject) =>
          setTimeout(() => reject(new Error('AI enrichment timeout')), 10000),
        ),
      ]);
    } catch (err) {
      console.error('[HomeService] AI enrichment failed, using base analytics:', err);
      analytics = baseAnalytics;
    }

    const snapshot = {
      user,
      settings,
      analytics,
      lastUpdated: new Date().toISOString(),
    };

    await this.redis.set(cacheKey, snapshot, 300);
    return snapshot;
  }

  async getInsights(userId: string): Promise<HomeInsights> {
    const { analytics, lastUpdated } = await this.getSnapshot(userId);
    const entries = await this.getDecodedEntries(userId);
    const reflectionHistogram = this.buildReflectionHistogram(entries);

    return {
      lastUpdated,
      isStale: entries.some((entry) => entry.updatedAt.getTime() > Date.parse(lastUpdated)),
      overview: analytics?.overview,
      monthlyQuote: analytics?.insights?.monthlyQuote ?? 'You are building your reflection rhythm.',
      monthlyAnalysis: analytics?.insights?.monthlyAnalysis ?? 'Not enough data yet.',
      statLine: analytics?.insights?.statLine ?? 'Keep writing.',
      statNote: analytics?.insights?.statNote ?? '',
      dominantTheme: analytics?.insights?.dominantTheme ?? 'Reflective',
      previousTheme: analytics?.insights?.previousTheme ?? '',
      thoughtThemes: (analytics?.insights?.thoughtThemes ?? []).map((theme) => ({
        key: theme.key,
        label: theme.label,
        count: theme.count,
        progress: theme.progress,
      })),
      finalSynthesis: analytics?.insights?.finalSynthesis ?? {
        headline: 'Just started',
        body: 'Keep writing.',
      },
      reflectionToneDescription: analytics?.insights?.reflectionToneDescription ?? '',
      relationshipMap: analytics?.insights?.relationshipMap ?? { nodes: [], links: [] },
      thinkingShifts: analytics?.insights?.thinkingShifts ?? [],
      clustersHeadline: analytics.clusters.headline,
      clusters: analytics.clusters.items,
      canvasFolders: analytics.canvas.folders,
      coreThemes: analytics.account.coreThemes,
      writingProfile: analytics.account.writingProfile,
      reflectionHistogram,
    };
  }

  private buildReflectionHistogram(entries: DecodedHomeEntry[]) {
    const counts = Array.from({ length: 24 }, (_value, hour) => ({
      hour,
      count: 0,
      percentage: 0,
    }));

    for (const entry of entries) {
      const hour = entry.createdAt.getHours();
      counts[hour].count += 1;
    }

    const max = Math.max(...counts.map((slot) => slot.count), 1);
    return counts.map((slot) => ({
      ...slot,
      percentage: Math.round((slot.count / max) * 100),
    }));
  }

  async getAccount(userId: string): Promise<HomeAccount> {
    const { analytics, user } = await this.getSnapshot(userId);

    // Always compute numerical stats completely fresh, bypassing any cache
    const daysJoined = Math.max(
      1,
      Math.ceil((Date.now() - new Date(user.createdAt).getTime()) / (24 * 60 * 60 * 1000)),
    );

    const freshEntries = await this.getDecodedEntries(userId);
    const freshAnalytics = buildHomeAnalytics({
      entries: freshEntries,
      preferences: this.buildSettingsFromUser(user),
      userName: user.name ?? 'Explorer',
      now: new Date(),
    });

    return {
      stats: {
        daysJoined,
        entries: freshAnalytics.overview.entryCount,
        streak: freshAnalytics.overview.currentStreak,
        mostActivePeriod: freshAnalytics.overview.mostActivePeriod,
      },
      writingProfile: analytics?.account?.writingProfile ?? {
        title: 'Thoughtful self-reflection',
        description: 'Your entries are grounding emotion in language.',
        tags: ['Reflective'],
      },
      coreThemes: analytics?.account?.coreThemes ?? [],
      consistencyMessage:
        freshAnalytics.overview.currentStreak >= 3
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

  async getOnboardingStatus(userId: string) {
    const user = await this.getUserRow(userId);
    const preferences = (user.preferences ?? {}) as Record<string, unknown>;
    const completed = preferences.onboardingCompleted === true;

    return {
      completed,
      isWaitlistUser: user.isWaitlistUser,
      message: user.isWaitlistUser
        ? 'You are always special to us. You are a waitlist member. Thank you.'
        : null,
    };
  }

  async exportAccountData(userId: string): Promise<AccountExport> {
    const user = await this.getUserRow(userId);
    const entries = await this.entriesService.getAllEntries(userId, 1000, 0);
    const settings = await this.getSettings(userId);
    const insights = await this.getInsights(userId);

    return {
      exportedAt: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        bio: user.bio,
        isWaitlistUser: user.isWaitlistUser,
      },
      entries: entries.items,
      settings,
      insights,
    };
  }

  async getClusters(userId: string): Promise<{
    headline: string;
    items: HomeCluster[];
    folders: Array<{ id: string; title: string; entryCount: number; updatedAtLabel: string }>;
  }> {
    const { analytics } = await this.getSnapshot(userId);
    const decodedEntries = await this.getDecodedEntries(userId);
    const aiClustered = await this.ensureAiClusters(userId, decodedEntries);
    if (!aiClustered) {
      await this.ensureReliableClusters(userId, analytics.clusters.items, decodedEntries);
    }

    const userFoldersAfterPromotion = await db
      .select({
        id: clusters.id,
        title: clusters.name,
        description: clusters.description,
        color: clusters.color,
        metadata: clusters.metadata,
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
                tones: folder.metadata?.themeTags?.length
                  ? folder.metadata.themeTags
                  : (analyticsMatch?.tones ?? ['Reflective', 'Focused']),
                color: folder.color,
                themeTags: folder.metadata?.themeTags ?? analyticsMatch?.tones ?? [],
                source: folder.metadata?.source ?? 'manual',
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

  async recluster(userId: string) {
    await this.redis.invalidatePattern(`home:*:${userId}*`);
    return this.getClusters(userId);
  }

  private buildDateFallbackClusterSpecs(entries: DecodedHomeEntry[]) {
    const now = new Date();
    const startOfThisWeek = new Date(now);
    startOfThisWeek.setUTCHours(0, 0, 0, 0);
    startOfThisWeek.setUTCDate(now.getUTCDate() - now.getUTCDay());
    const startOfLastWeek = new Date(startOfThisWeek);
    startOfLastWeek.setUTCDate(startOfThisWeek.getUTCDate() - 7);

    const groups = [
      {
        id: 'this-week',
        name: 'This Week',
        description: 'Entries written during the current week.',
        color: '#6F3A2E',
        theme_tags: ['recent', 'weekly'],
        entry_ids: [] as string[],
      },
      {
        id: 'last-week',
        name: 'Last Week',
        description: 'Entries from the previous week.',
        color: '#274A47',
        theme_tags: ['recent', 'past'],
        entry_ids: [] as string[],
      },
      {
        id: 'older',
        name: 'Older Reflections',
        description: 'Earlier entries waiting to connect with newer patterns.',
        color: '#473829',
        theme_tags: ['older', 'archive'],
        entry_ids: [] as string[],
      },
    ];

    for (const entry of entries) {
      if (entry.createdAt >= startOfThisWeek) {
        groups[0].entry_ids.push(entry.id);
      } else if (entry.createdAt >= startOfLastWeek) {
        groups[1].entry_ids.push(entry.id);
      } else {
        groups[2].entry_ids.push(entry.id);
      }
    }

    return groups.filter((group) => group.entry_ids.length > 0);
  }

  private async ensureAiClusters(userId: string, entries: DecodedHomeEntry[]): Promise<boolean> {
    if (entries.length === 0) return true;

    const latestEntryUpdatedAt = entries.reduce(
      (latest, entry) => Math.max(latest, entry.updatedAt.getTime()),
      0,
    );
    const existingAiClusters = await db
      .select({
        id: clusters.id,
        metadata: clusters.metadata,
        updatedAt: clusters.updatedAt,
      })
      .from(clusters)
      .where(eq(clusters.userId, userId));

    const hasFreshAiClusters = existingAiClusters.some((cluster) => {
      const generatedAt = cluster.metadata?.lastGeneratedAt
        ? Date.parse(cluster.metadata.lastGeneratedAt)
        : 0;
      return (
        cluster.metadata?.source === 'ai' &&
        Number.isFinite(generatedAt) &&
        generatedAt >= latestEntryUpdatedAt
      );
    });

    if (hasFreshAiClusters && entries.every((entry) => entry.clusterId)) {
      return true;
    }

    const generated = await generateEntryClusters({
      entries: entries.map((entry) => ({
        id: entry.id,
        title: entry.title,
        body: entry.text,
        createdAt: entry.createdAt.toISOString(),
      })),
    });

    const specs =
      generated?.clusters?.length &&
      this.validateGeneratedClusterCoverage(generated.clusters, entries)
        ? generated.clusters.map((cluster) => ({
            id: cluster.id,
            name: cluster.name,
            description: cluster.description,
            color: cluster.color,
            theme_tags: cluster.theme_tags,
            entry_ids: cluster.entry_ids,
            source: 'ai' as const,
          }))
        : this.buildDateFallbackClusterSpecs(entries).map((cluster) => ({
            ...cluster,
            source: 'date-fallback' as const,
          }));

    if (specs.length === 0) return false;

    const generatedAt = new Date().toISOString();
    const createdClusterIds: string[] = [];

    for (const spec of specs) {
      const [existing] = await db
        .select({ id: clusters.id })
        .from(clusters)
        .where(and(eq(clusters.userId, userId), eq(clusters.name, spec.name)))
        .limit(1);

      const metadata = {
        themeTags: spec.theme_tags,
        source: spec.source,
        lastGeneratedAt: generatedAt,
      };

      let clusterId = existing?.id;
      if (existing) {
        await db
          .update(clusters)
          .set({
            description: spec.description,
            color: spec.color,
            icon: 'folder',
            metadata,
            updatedAt: new Date(),
          })
          .where(and(eq(clusters.id, existing.id), eq(clusters.userId, userId)));
      } else {
        const [created] = await db
          .insert(clusters)
          .values({
            userId,
            name: spec.name,
            description: spec.description,
            color: spec.color,
            icon: 'folder',
            metadata,
          })
          .returning({ id: clusters.id });
        clusterId = created.id;
      }

      if (!clusterId) continue;
      createdClusterIds.push(clusterId);

      await db
        .update(journalEntries)
        .set({ clusterId, updatedAt: new Date() })
        .where(and(eq(journalEntries.userId, userId), inArray(journalEntries.id, spec.entry_ids)));
    }

    // Handle orphans (entries missed by AI but within the 80% threshold)
    const assignedEntryIds = new Set(specs.flatMap((s) => s.entry_ids));
    const orphans = entries.filter((e) => !assignedEntryIds.has(e.id));

    if (orphans.length > 0 && createdClusterIds.length > 0) {
      const fallbackClusterId = createdClusterIds[0];
      await db
        .update(journalEntries)
        .set({ clusterId: fallbackClusterId, updatedAt: new Date() })
        .where(
          and(
            eq(journalEntries.userId, userId),
            inArray(
              journalEntries.id,
              orphans.map((o) => o.id),
            ),
          ),
        );
    }

    await this.redis.invalidatePattern(`entries:all:${userId}:*`);
    return true;
  }

  private validateGeneratedClusterCoverage(
    clustersInput: Array<{ entry_ids?: string[] }>,
    entries: DecodedHomeEntry[],
  ): boolean {
    const validIds = new Set(entries.map((entry) => entry.id));
    if (validIds.size === 0) return true;

    let seenCount = 0;
    const seen = new Set<string>();

    for (const cluster of clustersInput) {
      if (!cluster.entry_ids?.length) continue;
      for (const entryId of cluster.entry_ids) {
        if (validIds.has(entryId) && !seen.has(entryId)) {
          seen.add(entryId);
          seenCount++;
        }
      }
    }

    // Require at least 80% coverage to accept AI clusters instead of falling back to dates
    const coverage = seenCount / validIds.size;
    return coverage >= 0.8;
  }

  /**
   * Promotes AI-suggested clusters to stable, database-backed folders
   * and automatically assigns matching entries to them.
   * Implements the logic: 2+ entries trigger a new thematic folder.
   */
  private async ensureReliableClusters(
    userId: string,
    suggestedClusters: HomeCluster[],
    entries: DecodedHomeEntry[],
  ): Promise<void> {
    // 1. Identify entries that aren't assigned to any cluster yet
    const unassignedEntries = entries.filter((e) => !e.clusterId);

    // 2. If we have 2+ unassigned entries, try to form a new dynamic cluster
    if (unassignedEntries.length >= 2) {
      const topKeywords = this.extractTopKeywordsFromEntries(unassignedEntries);
      if (topKeywords.length > 0) {
        const dynamicName = `Discovery: ${topKeywords[0].charAt(0).toUpperCase() + topKeywords[0].slice(1)}`;

        // Check if this dynamic folder already exists
        const [existing] = await db
          .select()
          .from(clusters)
          .where(and(eq(clusters.userId, userId), eq(clusters.name, dynamicName)))
          .limit(1);

        if (!existing) {
          const [created] = await db
            .insert(clusters)
            .values({
              userId,
              name: dynamicName,
              description: `A space automatically formed from your recent thoughts on ${topKeywords.join(', ')}.`,
            })
            .returning({ id: clusters.id });

          // Assign these unassigned entries to the new folder
          for (const entry of unassignedEntries) {
            await db
              .update(journalEntries)
              .set({ clusterId: created.id, updatedAt: new Date() })
              .where(eq(journalEntries.id, entry.id));
            entry.clusterId = created.id;
          }
        }
      }
    }

    // 3. Promote suggested clusters that have at least 2 entries (per design request)
    const robustClusters = suggestedClusters.filter((c) => c.entryCount >= 2);

    for (const cluster of robustClusters) {
      if (cluster.name === 'Recent Entries' && robustClusters.length > 1) {
        continue;
      }

      const [existing] = await db
        .select()
        .from(clusters)
        .where(and(eq(clusters.userId, userId), eq(clusters.name, cluster.name)))
        .limit(1);

      let clusterId = existing?.id;

      if (!existing) {
        const [created] = await db
          .insert(clusters)
          .values({
            userId,
            name: cluster.name,
            description:
              cluster.description || 'A space for your recent thoughts and explorations.',
          })
          .returning({ id: clusters.id });
        clusterId = created.id;
      }

      const matchWords =
        cluster.name === 'Recent Entries'
          ? []
          : cluster.name
              .toLowerCase()
              .split(/[^a-z0-9]+/g)
              .filter(Boolean);

      for (const entry of entries) {
        if (entry.clusterId) continue;

        let matches = false;
        if (cluster.name === 'Recent Entries') {
          matches = true;
        } else {
          const corpus = `${entry.title ?? ''} ${entry.text}`.toLowerCase();
          matches = matchWords.some((word) => corpus.includes(word));
        }

        if (matches) {
          await db
            .update(journalEntries)
            .set({ clusterId, updatedAt: new Date() })
            .where(eq(journalEntries.id, entry.id));
          entry.clusterId = clusterId;
        }
      }
    }
  }

  private extractTopKeywordsFromEntries(entries: DecodedHomeEntry[]): string[] {
    const counts = new Map<string, number>();
    const STOP_WORDS = new Set([
      'about',
      'after',
      'again',
      'also',
      'because',
      'been',
      'being',
      'feel',
      'from',
      'have',
      'into',
      'just',
      'more',
      'only',
      'that',
      'them',
      'they',
      'this',
      'through',
      'want',
      'when',
      'with',
      'your',
      'the',
      'and',
      'for',
      'are',
      'but',
      'not',
      'was',
      'you',
      'too',
      'will',
      'has',
      'had',
    ]);

    for (const entry of entries) {
      const corpus = `${entry.title ?? ''} ${entry.text}`.toLowerCase();
      const words = corpus
        .split(/[^a-z0-9]+/g)
        .filter((word) => word.length > 3 && !STOP_WORDS.has(word));

      for (const word of words) {
        counts.set(word, (counts.get(word) ?? 0) + 1);
      }
    }

    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([word]) => word);
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
    await db.delete(clusters).where(and(eq(clusters.id, folderId), eq(clusters.userId, userId)));
    await this.redis.invalidatePattern(`home:*:${userId}*`);
    return { deleted: true };
  }

  async getClusterDetail(userId: string, clusterId: string): Promise<HomeClusterDetail | null> {
    const { analytics } = await this.getSnapshot(userId);
    const entries = await this.getDecodedEntries(userId);
    const dbClusters = await db
      .select({
        id: clusters.id,
        name: clusters.name,
        description: clusters.description,
      })
      .from(clusters)
      .where(eq(clusters.userId, userId));

    const requestedSegment = normalizeRouteSegment(clusterId);
    const dbCluster =
      dbClusters.find(
        (candidate) =>
          candidate.id === clusterId ||
          candidate.name.toLowerCase() === decodeURIComponent(clusterId).toLowerCase() ||
          normalizeRouteSegment(candidate.name) === requestedSegment,
      ) ?? null;

    const cluster =
      analytics.clusters.items.find(
        (item) => item.id === clusterId || normalizeRouteSegment(item.name) === requestedSegment,
      ) ??
      (dbCluster
        ? ({
            id: dbCluster.id,
            name: dbCluster.name,
            entryCount: 0,
            updatedAtLabel: 'Recently',
            description: dbCluster.description ?? 'Your custom folder for related entries.',
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

    const matchingEntries = dbCluster
      ? entries.filter((entry) => entry.clusterId === dbCluster.id)
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

  private normalizeCanvasCards(cards: EntryCanvasCard[]): EntryCanvasCard[] {
    const sorted = cards.slice(0, 8).map((card, index) => ({
      ...card,
      id: card.id || `card_${index + 1}`,
      x: Math.max(0, Math.min(900, Number.isFinite(card.x) ? card.x : 120 + index * 80)),
      y: Math.max(0, Math.min(600, Number.isFinite(card.y) ? card.y : 80 + index * 60)),
      width: Math.max(160, Math.min(260, Number.isFinite(card.width) ? card.width : 220)),
      height: Math.max(100, Math.min(180, Number.isFinite(card.height) ? card.height : 140)),
      color: card.color || '#1C1C1C',
      border_color: card.border_color || '#E07A5F',
    }));

    for (let i = 0; i < sorted.length; i += 1) {
      const card = sorted[i];
      for (let j = 0; j < i; j += 1) {
        const other = sorted[j];
        const overlaps =
          Math.abs(card.x - other.x) < Math.min(card.width, other.width) &&
          Math.abs(card.y - other.y) < Math.min(card.height, other.height);
        if (overlaps) {
          card.x = Math.min(900 - card.width, card.x + 24 * (i + 1));
          card.y = Math.min(600 - card.height, card.y + 20 * (i + 1));
        }
      }
    }

    return sorted;
  }

  private buildStarterCanvas(entry: DecodedHomeEntry, clusterName = 'Recent Entries'): EntryCanvas {
    const title = entry.title || entry.text.split(/\s+/).slice(0, 6).join(' ') || 'Untitled entry';
    const body = entry.text.split('\n').find(Boolean) ?? entry.text;
    const words = entry.text.split(/\s+/).filter(Boolean);
    const secondBody = words
      .slice(0, Math.max(8, Math.min(32, Math.floor(words.length / 2))))
      .join(' ');

    const cards: EntryCanvasCard[] = this.normalizeCanvasCards([
      {
        id: 'card_1',
        type: 'reflection',
        title,
        body: body.slice(0, 420) || 'Start shaping this thought manually.',
        x: 120,
        y: 110,
        width: 230,
        height: 150,
        color: '#1C1C1C',
        border_color: '#E07A5F',
        tag: 'Entry',
      },
      ...(words.length > 8
        ? [
            {
              id: 'card_2',
              type: 'idea' as const,
              title: 'Key Thread',
              body: secondBody || body.slice(0, 240),
              x: 470,
              y: 270,
              width: 220,
              height: 130,
              color: '#171313',
              border_color: '#8B3A3A',
              tag: clusterName,
            },
          ]
        : []),
    ]);

    return {
      entryId: entry.id,
      canvasTitle: title,
      cards,
      connections:
        cards.length > 1
          ? [{ id: 'conn_card_1_card_2', from: 'card_1', to: 'card_2', label: 'connects to' }]
          : [],
      clusterInsight:
        cards.length > 1
          ? `This entry begins forming a ${clusterName.toLowerCase()} thread.`
          : 'Add another card or regenerate when there is more text to analyze.',
      lastEdited: new Date().toISOString(),
      generatedAt: new Date().toISOString(),
      source: 'fallback',
    };
  }

  private async getEntryForCanvas(userId: string, entryId: string): Promise<DecodedHomeEntry> {
    const entries = await this.getDecodedEntries(userId);
    const entry = entries.find((candidate) => candidate.id === entryId);
    if (!entry) {
      throw new Error('Entry not found');
    }
    return entry;
  }

  private async buildGeneratedCanvas(userId: string, entryId: string): Promise<EntryCanvas> {
    const entry = await this.getEntryForCanvas(userId, entryId);
    const cluster = entry.clusterId ? await this.getClusterDetail(userId, entry.clusterId) : null;
    const clusterName = cluster?.cluster.name ?? 'Recent Entries';
    const aiCanvas = await generateEntryCanvas({
      entryTitle: entry.title || entry.text.split(/\s+/).slice(0, 6).join(' ') || 'Untitled entry',
      entryBody: entry.text,
      clusterName,
      clusterTags: cluster?.cluster.tones ?? [],
    });

    if (!aiCanvas) {
      return this.buildStarterCanvas(entry, clusterName);
    }

    const cards = this.normalizeCanvasCards(aiCanvas.cards as EntryCanvasCard[]);
    const cardIds = new Set(cards.map((card) => card.id));
    const connections: EntryCanvasConnection[] = aiCanvas.connections
      .filter((connection) => cardIds.has(connection.from) && cardIds.has(connection.to))
      .map((connection) => ({
        id: `conn_${connection.from}_${connection.to}`,
        from: connection.from,
        to: connection.to,
        label: connection.label,
      }));

    return {
      entryId,
      canvasTitle: aiCanvas.canvas_title,
      cards,
      connections,
      clusterInsight: aiCanvas.cluster_insight,
      lastEdited: new Date().toISOString(),
      generatedAt: new Date().toISOString(),
      source: 'ai',
    };
  }

  private async persistEntryCanvas(userId: string, canvas: EntryCanvas): Promise<EntryCanvas> {
    const now = new Date();
    const [saved] = await db
      .insert(entryCanvases)
      .values({
        userId,
        entryId: canvas.entryId,
        canvasTitle: canvas.canvasTitle,
        cards: canvas.cards,
        connections: canvas.connections,
        clusterInsight: canvas.clusterInsight,
        generationMetadata: {
          generatedAt: canvas.generatedAt,
          source: canvas.source === 'saved' ? 'manual' : canvas.source,
        },
        lastEdited: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: entryCanvases.entryId,
        set: {
          canvasTitle: canvas.canvasTitle,
          cards: canvas.cards,
          connections: canvas.connections,
          clusterInsight: canvas.clusterInsight,
          generationMetadata: {
            generatedAt: canvas.generatedAt,
            source: canvas.source === 'saved' ? 'manual' : canvas.source,
          },
          lastEdited: now,
          updatedAt: now,
        },
      })
      .returning();

    return {
      entryId: saved.entryId,
      canvasTitle: saved.canvasTitle,
      cards: saved.cards,
      connections: saved.connections,
      clusterInsight: saved.clusterInsight ?? '',
      lastEdited: saved.lastEdited.toISOString(),
      generatedAt: saved.generationMetadata?.generatedAt,
      source: canvas.source,
    };
  }

  async getEntryCanvas(userId: string, entryId: string): Promise<EntryCanvas> {
    await this.getEntryForCanvas(userId, entryId);

    const [saved] = await db
      .select()
      .from(entryCanvases)
      .where(and(eq(entryCanvases.userId, userId), eq(entryCanvases.entryId, entryId)))
      .limit(1);

    if (saved) {
      return {
        entryId: saved.entryId,
        canvasTitle: saved.canvasTitle,
        cards: this.normalizeCanvasCards(saved.cards),
        connections: saved.connections,
        clusterInsight: saved.clusterInsight ?? '',
        lastEdited: saved.lastEdited.toISOString(),
        generatedAt: saved.generationMetadata?.generatedAt,
        source: 'saved',
      };
    }

    const generated = await this.buildGeneratedCanvas(userId, entryId);
    return this.persistEntryCanvas(userId, generated);
  }

  async saveEntryCanvas(
    userId: string,
    input: {
      entryId: string;
      canvasTitle: string;
      cards: EntryCanvasCard[];
      connections: EntryCanvasConnection[];
      clusterInsight?: string;
    },
  ): Promise<EntryCanvas> {
    await this.getEntryForCanvas(userId, input.entryId);
    return this.persistEntryCanvas(userId, {
      entryId: input.entryId,
      canvasTitle: input.canvasTitle,
      cards: this.normalizeCanvasCards(input.cards),
      connections: input.connections,
      clusterInsight: input.clusterInsight ?? '',
      lastEdited: new Date().toISOString(),
      source: 'manual',
    });
  }

  async regenerateEntryCanvas(userId: string, entryId: string): Promise<EntryCanvas> {
    const generated = await this.buildGeneratedCanvas(userId, entryId);
    return this.persistEntryCanvas(userId, generated);
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
