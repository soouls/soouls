'use client';

import { useClerk, useUser } from '@clerk/nextjs';
import { ActionButton, DashboardLayout, StatsWidget, WidgetCard } from '@soouls/ui-kit';
import {
  CheckCircle2,
  ChevronRight,
  Image as ImageIcon,
  LogOut,
  Mic,
  PenLine,
  Plus,
} from 'lucide-react'; // Fixed imports
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { LogoutModal } from './LogoutModal';
import { ProfileRail } from './new-entry/dashboard/ProfileRail';
import { extractEntryPreview } from './new-entry/payload';
import { getOptimizedImageUrl } from '../../src/utils/images';
import { trpc } from '../../src/utils/trpc'; // Relative path

function formatRelativeTime(dateInput: string | Date | undefined | null) {
  if (!dateInput) return 'Past';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays <= 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
  return `${Math.floor(diffInDays / 365)} years ago`;
}

function MigrationButton() {
  const utils = trpc.useContext();
  const mutation = trpc.private.entries.migrateMedia.useMutation({
    onSuccess: (data) => {
      if (data.migratedCount > 0) {
        alert(`Successfully migrated ${data.migratedCount} media blocks to cloud storage!`);
        utils.private.entries.getGalaxy.invalidate();
      } else {
        alert('No legacy base64 media found to migrate.');
      }
    },
    onError: (error) => {
      alert(`Migration failed: ${error.message}`);
    },
  });

  return (
    <ActionButton
      variant="secondary"
      icon={mutation.isPending ? undefined : ChevronRight}
      onClick={() => mutation.mutate({})}
      disabled={mutation.isPending}
      className={mutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}
    >
      {mutation.isPending ? 'Syncing...' : 'Sync Cloud Storage'}
    </ActionButton>
  );
}

function computeEntryStreak(entries: Array<{ createdAt: string | Date }> | undefined) {
  if (!entries || entries.length === 0) {
    return 0;
  }

  const dayKeys = Array.from(
    new Set(
      entries.map((entry) => {
        const date = new Date(entry.createdAt);
        return new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString();
      }),
    ),
  )
    .map((value) => new Date(value).getTime())
    .sort((a, b) => b - a);

  let streak = 0;
  let cursor = new Date();
  cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate());

  for (const day of dayKeys) {
    const currentDay = cursor.getTime();
    const previousDay = currentDay - 24 * 60 * 60 * 1000;
    if (day === currentDay || (streak === 0 && day === previousDay)) {
      streak += 1;
      cursor = new Date(day - 24 * 60 * 60 * 1000);
      continue;
    }

    if (day === cursor.getTime()) {
      streak += 1;
      cursor = new Date(day - 24 * 60 * 60 * 1000);
      continue;
    }

    break;
  }

  return streak;
}

export default function DashboardPage() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const { data: profile } = trpc.private.profile.getCurrent.useQuery(undefined);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [promptIndex, setPromptIndex] = useState(0);

  const { data: rawGalaxyData } = trpc.private.entries.getGalaxy.useQuery({ limit: 100 });
  const galaxyData = rawGalaxyData?.items;

  const { data: rawTimelineData } = trpc.private.entries.getAll.useQuery({ limit: 50 });
  const timelineData = rawTimelineData?.items;
  const entryStreak = computeEntryStreak(timelineData);

  const processedGalaxyData = useMemo(() => {
    if (!galaxyData || galaxyData.length === 0) return [];
    return galaxyData.map((entry) => ({
      ...entry,
      displayTitleTimeline:
        (entry.previewText || '').length > 30
          ? `${(entry.previewText || '').substring(0, 30)}...`
          : entry.previewText || 'Empty entry',
    }));
  }, [galaxyData]);

  const totalEntries = processedGalaxyData?.length || 0;

  const latestEntry =
    processedGalaxyData && processedGalaxyData.length > 0 ? processedGalaxyData[0] : null;

  const latestEntryId = latestEntry ? latestEntry.id : null;
  const continueLink = latestEntryId
    ? `/dashboard/new-entry?id=${latestEntryId}`
    : '/dashboard/new-entry';

  // Use previewText from latest entry
  const decodedLatestContent = latestEntry ? latestEntry.previewText : '';
  const firstLine = decodedLatestContent
    ? decodedLatestContent.split('\n').find((l) => l.trim().length > 0)
    : null;
  const displayTitle = firstLine
    ? firstLine.length > 40
      ? `${firstLine.substring(0, 40)}...`
      : firstLine
    : 'Latest Entry';

  const rotatingLines = [
    'You do not need clarity to start. Clarity comes after you make entry.',
    'Begin with one honest note. Your meaning will organize itself after that.',
    'The door opens the moment you leave perfection outside and enter anyway.',
  ];

  useEffect(() => {
    setPromptIndex(Math.floor(Math.random() * rotatingLines.length));
    const timer = window.setInterval(() => {
      setPromptIndex((current) => (current + 1) % rotatingLines.length);
    }, 8 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, [rotatingLines.length]);

  const dynamicPrompt = rotatingLines[promptIndex] ?? rotatingLines[0] ?? '';

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await signOut({ redirectUrl: '/' });
    } finally {
      setIsLoggingOut(false);
      setLogoutOpen(false);
    }
  }

  return (
    <DashboardLayout
      headerLabel="Dashboard"
      profileSlot={
        <ProfileRail
          name={profile?.name || profile?.onboardingProfile?.displayName || user?.firstName || 'Devon Lane'}
          greeting="Hello there,"
          streakLabel={
            entryStreak > 0
              ? `You're showing up ${entryStreak} ${entryStreak === 1 ? 'day' : 'days'} in a row.`
              : 'Your universe is waiting for the next honest note.'
          }
          avatarUrl={user?.imageUrl}
          avatarSeed={profile?.email || user?.id || 'soouls'}
        />
      }
      footerSlot={
        <button
          type="button"
          onClick={() => setLogoutOpen(true)}
          className="flex w-full items-center gap-3 rounded-[1.2rem] px-4 py-3 text-left text-red-500 transition hover:bg-white/5"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-urbanist text-xl font-medium">Logout</span>
        </button>
      }
      userActionSlot={
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 rounded-full border border-[var(--app-border)] bg-white/5 px-4 py-2 text-sm text-[var(--app-text)] transition hover:bg-white/10"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--app-accent-soft)] text-[var(--app-accent)]">
            {(profile?.name || user?.firstName || 'S').charAt(0).toUpperCase()}
          </span>
          <div className="hidden text-left sm:block">
            <div className="text-xs uppercase tracking-[0.24em] text-[var(--app-text-muted)]">
              {profile?.onboardingProfile?.universeName || 'Universe'}
            </div>
            <div>{profile?.name || user?.firstName || 'Settings'}</div>
          </div>
        </Link>
      }
    >
      <section className="relative overflow-hidden rounded-[2.25rem] border border-white/7 bg-[#161616]/80 px-8 py-10 shadow-[0_32px_120px_-60px_rgba(0,0,0,0.85)]">
        <div className="absolute inset-0 opacity-[0.06] [background-image:radial-gradient(circle_at_center,transparent_0,transparent_28%,rgba(255,255,255,0.7)_28.4%,transparent_29%),radial-gradient(circle_at_center,transparent_0,transparent_46%,rgba(255,255,255,0.35)_46.4%,transparent_47%)]" />
        <div className="relative z-10 max-w-4xl space-y-8">
          <div className="flex items-center justify-between gap-4">
            <span className="rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-[var(--app-text-muted)]">
              Canvas
            </span>
            <span className="text-xs uppercase tracking-[0.28em] text-[var(--app-text-muted)]">
              {profile?.onboardingProfile?.universeName || 'Your universe'}
            </span>
          </div>
          <h1 className="max-w-3xl font-urbanist text-5xl font-light leading-[0.95] text-white sm:text-6xl">
            {dynamicPrompt.split('make entry').length > 1 ? (
              <>
                You do not need clarity to start. Clarity comes after you{' '}
                <span className="font-editorial italic text-[var(--app-accent)]">make entry.</span>
              </>
            ) : (
              dynamicPrompt
            )}
          </h1>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/dashboard/new-entry">
              <ActionButton icon={Plus}>Make Entry</ActionButton>
            </Link>
            <Link href={continueLink}>
              <ActionButton variant="secondary" icon={ChevronRight}>
                {latestEntryId ? 'Continue latest' : 'Open canvas'}
              </ActionButton>
            </Link>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <WidgetCard
          title="Final synthesis"
          className="relative min-h-[340px] bg-[#171717]"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0F0F0F] z-10" />
          <div className="relative z-10 space-y-6">
            <div className="text-right text-xs uppercase tracking-[0.24em] text-[var(--app-text-muted)]">
              {profile?.onboardingProfile?.universeName || 'Universe pulse'}
            </div>
            {processedGalaxyData && processedGalaxyData.length > 0 ? (
              <Link href={continueLink} className="block group space-y-5">
                <p className="text-sm uppercase tracking-[0.28em] text-[var(--app-accent)]">
                  Current reflection
                </p>
                <h3 className="max-w-3xl font-editorial text-4xl leading-tight text-white/90 transition-colors group-hover:text-[var(--app-accent)]">
                  {displayTitle}
                </h3>
                <p className="max-w-3xl font-editorial text-3xl leading-tight text-white/70">
                  {latestEntry ? decodedLatestContent : 'Loading...'}
                </p>
                <p className="max-w-3xl text-sm leading-7 text-[var(--app-text-muted)]">
                  Your active thread keeps pointing toward turning scattered inspiration into
                  focused action. Return to the live canvas and keep the thought warm.
                </p>
              </Link>
            ) : (
              <p className="max-w-3xl font-editorial text-3xl leading-tight text-white/60">
                Your next synthesis will appear here once the first entry lands.
              </p>
            )}
          </div>
          <div className="absolute bottom-6 left-6 right-6 z-20 flex flex-wrap items-center gap-4">
            <div className="flex gap-3 text-xs uppercase tracking-[0.26em] text-[var(--app-text-muted)]">
              <span className="flex items-center gap-1">
                <Mic className="h-3 w-3" /> Voice
              </span>
              <span className="flex items-center gap-1">
                <PenLine className="h-3 w-3" /> Text
              </span>
              <span className="flex items-center gap-1">
                <ImageIcon className="h-3 w-3" /> Media
              </span>
            </div>
            <div className="ml-auto flex flex-wrap items-center gap-3">
              <MigrationButton />
              <Link href="/dashboard/new-entry">
                <ActionButton variant="secondary" icon={Plus}>
                  New Entry
                </ActionButton>
              </Link>
            </div>
          </div>
        </WidgetCard>

        <div className="grid gap-6">
          <WidgetCard title="Thought themes" className="bg-[var(--app-surface-strong)]">
            <StatsWidget totalEntries={totalEntries} />
          </WidgetCard>

          <WidgetCard title="Tasklist" className="bg-[var(--app-surface-strong)]">
            <div className="space-y-3 mt-2">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="mt-0.5">
                  <CheckCircle2 className="w-4 h-4 text-slate-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-300">Read "Atomic Habits"</p>
                  <p className="text-xs text-slate-500 mt-1">Today</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="mt-0.5">
                  <CheckCircle2 className="h-4 w-4 text-[var(--app-accent)]" />
                </div>
                <div>
                  <p className="text-sm text-[var(--app-text)]">Brainstorm ideas</p>
                  <p
                    className="mt-1 text-xs"
                    style={{ color: 'color-mix(in srgb, var(--app-accent) 80%, white 20%)' }}
                  >
                    Tomorrow
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="w-full py-2 text-xs text-[var(--app-text-muted)] transition-colors hover:text-[var(--app-text)]"
              >
                + Add task
              </button>
            </div>
          </WidgetCard>

          <WidgetCard title="Reflection patterns">
            <div className="rounded-2xl border border-[var(--app-border)] bg-[linear-gradient(135deg,var(--app-accent-soft),transparent_70%)] p-4">
              <div className="mb-2 flex items-start justify-between">
                <span className="text-xs font-clarity uppercase text-[var(--app-accent)]">
                  Current pulse
                </span>
              </div>
              <p className="text-sm text-white/80">
                You tend to write most during late evenings. Your thought clusters are more
                structured when voice or media is present.
              </p>
            </div>
          </WidgetCard>
        </div>
      </div>

      {/* Historical Entries Timeline (using getAll for full content) */}
      {timelineData && timelineData.length > 0 && (
        <section className="mt-16 mb-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-editorial text-3xl text-[var(--app-text)]">Your Timeline</h2>
            <Link
              href="/dashboard/calendar"
              className="flex items-center font-clarity text-sm text-[var(--app-text-muted)] transition-colors hover:text-[var(--app-text)]"
            >
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {timelineData.map((entry) => {
              const entryText = extractEntryPreview(entry.content);
              const firstLineMatches = (entryText || '')
                .split('\n')
                .filter((l) => l.trim().length > 0);
              const firstLine = firstLineMatches[0] ?? 'Empty entry';
              const displayTitle =
                firstLine.length > 30 ? `${firstLine.substring(0, 30)}...` : firstLine;

              return (
                <Link
                  key={entry.id}
                  href={`/dashboard/new-entry?id=${entry.id}`}
                  className="block group"
                >
                  <div className="p-6 rounded-[24px] bg-[#0F0F0F] border border-white/5 hover:bg-[#e07a5f]/10 hover:border-[#e07a5f]/20 hover:shadow-[0_0_15px_rgba(224,122,95,0.15)] transition-all duration-300 h-full flex flex-col justify-between min-h-[160px]">
                    {/* Media thumbnail */}
                    {entry.mediaUrl && (
                      <div className="mb-3 relative w-full h-28 rounded-xl overflow-hidden bg-slate-900/50">
                        <img
                          src={getOptimizedImageUrl(entry.mediaUrl, { width: 600, quality: 85 })}
                          alt="Entry media"
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute top-2 right-2">
                          <ImageIcon className="w-4 h-4 text-white/70" />
                        </div>
                      </div>
                    )}
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-clarity uppercase text-slate-500 tracking-widest">
                          {formatRelativeTime(entry.createdAt)}
                        </span>
                        {entry.type === 'task' ? (
                          <CheckCircle2 className="w-4 h-4 text-slate-600" />
                        ) : (
                          <PenLine className="w-4 h-4 text-slate-600" />
                        )}
                      </div>
                      <h4 className="font-editorial text-xl text-slate-300 group-hover:text-amber-500 transition-colors">
                        {displayTitle}
                      </h4>
                    </div>
                    <p className="font-clarity text-sm text-slate-500 mt-3 line-clamp-2 leading-relaxed">
                      {entryText}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <LogoutModal
        open={logoutOpen}
        onStay={() => setLogoutOpen(false)}
        onLogout={() => void handleLogout()}
        isSubmitting={isLoggingOut}
      />
    </DashboardLayout>
  );
}
