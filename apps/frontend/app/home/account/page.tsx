'use client';

import { useAuth, useClerk, useUser } from '@clerk/nextjs';
import type { UserEntry } from '@soouls/api/router';
import {
  ArrowLeft,
  Calendar,
  CloudSun,
  Download,
  Flame,
  HardDrive,
  Loader2,
  Moon,
  PenLine,
  Shield,
  Trash2,
  TrendingUp,
  Upload,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useSidebar } from '../../../src/providers/sidebar-provider';
import { downloadJson } from '../../../src/utils/home';
import { getTRPCClient, trpc } from '../../../src/utils/trpc';

const FONT_PLAYFAIR = "'Playfair Display', Georgia, serif";
const FONT_URBANIST = "'Urbanist', system-ui, sans-serif";

function avatarFor(seed?: string | null) {
  return `https://api.dicebear.com/9.x/glass/svg?seed=${encodeURIComponent(seed || 'Soouls')}&backgroundColor=1c1c1c,e07a5f&radius=50`;
}

function StatCard({
  value,
  label,
  icon,
}: { value: string | number; label: string; icon: React.ReactNode }) {
  return (
    <div
      className="flex min-h-[132px] flex-col justify-between rounded-[24px] border p-5"
      style={{ backgroundColor: 'var(--soouls-bg-surface)', borderColor: 'var(--soouls-border)' }}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className="text-4xl font-semibold leading-none sm:text-5xl"
          style={{ color: 'var(--soouls-accent)' }}
        >
          {value}
        </span>
        <span style={{ color: 'var(--soouls-accent)' }}>{icon}</span>
      </div>
      <p className="text-sm font-medium uppercase tracking-wide text-[var(--soouls-text-muted)]">
        {label}
      </p>
    </div>
  );
}

function Tag({ label }: { label: string }) {
  return (
    <span
      className="rounded-full border px-4 py-1.5 text-sm text-[var(--soouls-text-muted)]"
      style={{ borderColor: 'rgba(255,255,255,0.14)' }}
    >
      {label}
    </span>
  );
}

function ThemeBar({ label, percent }: { label: string; percent: number }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm font-medium" style={{ color: 'var(--soouls-accent)' }}>
        {label}
      </span>
      <span className="text-sm text-[var(--soouls-text-muted)]">{percent}%</span>
    </div>
  );
}

function OutlineButton({
  children,
  icon,
  onClick,
  danger = false,
  disabled = false,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-2.5 rounded-full border px-6 py-3 text-sm font-medium transition-all disabled:opacity-50"
      style={{
        borderColor: danger ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.15)',
        color: danger ? '#f87171' : 'var(--soouls-text-muted)',
      }}
    >
      {icon}
      {children}
    </button>
  );
}

function DataActionButton({
  children,
  icon,
  onClick,
  loading = false,
}: { children: React.ReactNode; icon: React.ReactNode; onClick: () => void; loading?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="flex min-w-[220px] flex-1 items-center gap-3 rounded-2xl border px-5 py-4 text-sm font-medium transition-all hover:bg-white/5 disabled:opacity-60"
      style={{
        backgroundColor: 'var(--soouls-bg-surface)',
        borderColor: 'var(--soouls-border)',
        color: 'var(--soouls-text-muted)',
      }}
    >
      <span style={{ color: 'var(--soouls-accent)' }}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      </span>
      {children}
    </button>
  );
}

export default function AccountPage() {
  const router = useRouter();
  const { setIsOpen } = useSidebar();
  const { user } = useUser();
  const { getToken } = useAuth();
  const { signOut } = useClerk();
  const trpcClient = useMemo(() => getTRPCClient(getToken), [getToken]);
  const [exporting, setExporting] = useState<'all' | 'entries' | null>(null);

  const { data: account } = trpc.private.home.getAccount.useQuery(undefined);
  const { data: insights } = trpc.private.home.getInsights.useQuery(undefined);
  const { data: settings } = trpc.private.home.getSettings.useQuery(undefined);
  const deleteAccount = trpc.private.home.deleteAccount.useMutation({
    onSuccess: async () => signOut({ redirectUrl: '/' }),
  });

  const displayName = user?.fullName || user?.firstName || 'Unknown name';
  const email = user?.primaryEmailAddress?.emailAddress || 'you@example.com';
  const avatarUrl = user?.imageUrl || avatarFor(email || user?.id);
  const stats = account?.stats;

  const loadAllEntries = async (): Promise<UserEntry[]> => {
    const items: UserEntry[] = [];
    let cursor: number | null = 0;
    while (cursor !== null) {
      const response = await trpcClient.private.entries.getAll.query({ cursor, limit: 200 });
      items.push(...response.items);
      cursor = response.nextCursor;
    }
    return items;
  };

  const handleExportAll = async () => {
    try {
      setExporting('all');
      const entries = await loadAllEntries();
      downloadJson(`soouls-data-${new Date().toISOString().slice(0, 10)}.json`, {
        exportedAt: new Date().toISOString(),
        account,
        insights,
        settings,
        entries,
      });
    } finally {
      setExporting(null);
    }
  };

  const handleBackupEntries = async () => {
    try {
      setExporting('entries');
      const entries = await loadAllEntries();
      downloadJson(`soouls-entries-backup-${new Date().toISOString().slice(0, 10)}.json`, {
        exportedAt: new Date().toISOString(),
        entries,
      });
    } finally {
      setExporting(null);
    }
  };

  const handleDeleteAccount = () => {
    if (
      window.confirm('This will permanently delete your Soouls account and journal data. Continue?')
    ) {
      deleteAccount.mutate();
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden select-none"
      style={{ backgroundColor: '#1F1F1F', color: '#EFEDDD', fontFamily: FONT_URBANIST }}
    >
      <div className="absolute top-12 left-0 right-0 flex justify-center pointer-events-none opacity-[0.7] select-none z-0 overflow-hidden whitespace-nowrap">
        <span
          className="text-[18vw] font-urbanist font-light leading-none text-transparent tracking-widest"
          style={{
            WebkitTextStroke: '1px rgba(255,255,255,0.7)',
          }}
        >
          Soouls
        </span>
      </div>

      <header className="w-full max-w-[1600px] mx-auto px-6 md:px-12 py-8 flex justify-between items-center relative z-20">
        <div className="flex items-center gap-2 text-[22px] font-light tracking-wide">
          <Link
            href="/home"
            className="text-white/40 hover:text-white transition-colors"
          >
            Home
          </Link>
          <span className="text-[#D46B4E] ml-2">/ Account</span>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="w-10 h-10 rounded-full border-2 border-white/10 hover:border-white/30 transition-all cursor-pointer overflow-hidden shadow-[0_4px_4px_rgba(0,0,0,0.25)]"
        >
          {user?.imageUrl && (
            <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
          )}
        </button>
      </header>

      <main className="flex-1 w-full max-w-[1600px] mx-auto px-6 md:px-12 relative z-10 flex flex-col mt-12 pb-0 items-stretch">
        <section
          className="flex-1 backdrop-blur-[48px] border-t border-white/10 rounded-t-[32px] overflow-hidden flex flex-col p-6 md:p-12 pb-32 overflow-y-auto custom-scrollbar"
          style={{ backgroundColor: 'rgba(15, 15, 15, 0.6)' }}
        >
          <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
            <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left lg:col-span-6">
              <div className="relative shrink-0">
                <div className="absolute -inset-1 rounded-full bg-[rgba(var(--soouls-accent-rgb),0.35)] blur" />
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="relative h-28 w-28 rounded-full object-cover ring-4 ring-[#111111] sm:h-32 sm:w-32"
                />
                <div className="absolute bottom-2 right-2 h-5 w-5 rounded-full bg-emerald-500 ring-4 ring-[#111111]" />
              </div>
              <div className="min-w-0 space-y-2">
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-[var(--soouls-text-faint)]">
                  Your Profile
                </p>
                <h1
                  className="break-words text-4xl leading-none sm:text-5xl"
                  style={{ fontFamily: FONT_PLAYFAIR, fontStyle: 'italic', fontWeight: 600 }}
                >
                  {displayName}
                </h1>
                <p className="text-lg font-medium" style={{ color: 'var(--soouls-accent)' }}>
                  {email}
                </p>
                <p className="max-w-sm text-base text-[var(--soouls-text-muted)]">
                  {account?.bio ?? 'Trying to make sense of my thoughts.'}
                </p>
                <div className="flex items-center justify-center gap-2 pt-1 text-emerald-400 sm:justify-start">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {account?.consistencyMessage ?? "You're building momentum."}
                  </span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 lg:col-span-6">
              <StatCard
                value={stats?.daysJoined ?? 0}
                label="Days Joined"
                icon={<Calendar className="h-6 w-6" />}
              />
              <StatCard
                value={stats?.entries ?? 0}
                label="Entries"
                icon={<PenLine className="h-6 w-6" />}
              />
              <StatCard
                value={stats?.streak ?? 0}
                label="Day Streak"
                icon={<Flame className="h-6 w-6" />}
              />
              <StatCard
                value={stats?.mostActivePeriod ?? 'Evenings'}
                label="Most Active"
                icon={
                  (stats?.mostActivePeriod ?? '').toLowerCase().includes('night') ? (
                    <Moon className="h-6 w-6" />
                  ) : (
                    <CloudSun className="h-6 w-6" />
                  )
                }
              />
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-12 mt-4">
            <div
              className="rounded-[32px] border p-6 lg:col-span-8 lg:p-8"
              style={{ backgroundColor: 'rgba(17,17,17,0.8)', borderColor: 'var(--soouls-border)' }}
            >
              <p className="mb-1 text-base font-medium text-[var(--soouls-text-muted)]">
                Your writing patterns
              </p>
              <p className="mb-5 text-xs font-bold uppercase tracking-[0.24em] text-[var(--soouls-text-faint)]">
                Primary Style
              </p>
              <h2
                className="max-w-2xl text-4xl leading-tight"
                style={{ fontFamily: FONT_PLAYFAIR, fontStyle: 'italic', fontWeight: 600 }}
              >
                {account?.writingProfile.title ??
                  insights?.writingProfile.title ??
                  'Thoughtful self-reflection'}
              </h2>
              <p
                className="mt-4 max-w-2xl text-base leading-relaxed"
                style={{ color: 'var(--soouls-accent)' }}
              >
                {account?.writingProfile.description ??
                  insights?.writingProfile.description ??
                  'Your entries are grounding emotion in language and turning reflection into clarity.'}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                {(
                  account?.writingProfile.tags ??
                  insights?.writingProfile.tags ?? ['Reflective']
                ).map((tag) => (
                  <Tag key={tag} label={tag} />
                ))}
              </div>
            </div>
            <div
              className="rounded-[32px] border p-6 lg:col-span-4 lg:p-8"
              style={{ backgroundColor: 'rgba(17,17,17,0.8)', borderColor: 'var(--soouls-border)' }}
            >
              <p className="mb-1 text-base font-medium text-[var(--soouls-text-muted)]">
                Insight Analysis
              </p>
              <p className="mb-5 text-xs font-bold uppercase tracking-[0.24em] text-[var(--soouls-text-faint)]">
                Core Theme
              </p>
              <div className="divide-y divide-white/5">
                {(account?.coreThemes ?? insights?.coreThemes ?? []).slice(0, 3).map((theme) => (
                  <ThemeBar key={theme.label} label={theme.label} percent={theme.percent} />
                ))}
              </div>
              <p className="mt-5 text-center text-xs leading-relaxed text-[var(--soouls-text-faint)]">
                Insights are based on your real entry cadence, recurring themes, and tone patterns.
              </p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-12 mt-4">
            <div
              className="rounded-[32px] border p-6 lg:col-span-8 lg:p-8"
              style={{ backgroundColor: 'rgba(17,17,17,0.8)', borderColor: 'var(--soouls-border)' }}
            >
              <p className="mb-5 text-base font-medium text-[var(--soouls-text-muted)]">
                Data &amp; Ownership
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <DataActionButton
                  icon={<Download className="h-5 w-5" />}
                  onClick={handleExportAll}
                  loading={exporting === 'all'}
                >
                  Download your data
                </DataActionButton>
                <DataActionButton
                  icon={<Upload className="h-5 w-5" />}
                  onClick={handleBackupEntries}
                  loading={exporting === 'entries'}
                >
                  Backup your entries
                </DataActionButton>
              </div>
            </div>
            <div
              className="rounded-[32px] border p-6 lg:col-span-4 lg:p-8"
              style={{ backgroundColor: 'rgba(17,17,17,0.8)', borderColor: 'var(--soouls-border)' }}
            >
              <div className="mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-emerald-400" />
                <p className="text-sm font-bold uppercase tracking-wider text-emerald-400">
                  Privacy Snapshot
                </p>
              </div>
              <p
                className="text-3xl leading-tight"
                style={{ fontFamily: FONT_PLAYFAIR, fontStyle: 'italic', fontWeight: 600 }}
              >
                Your privacy comes first.
              </p>
              <p className="mt-4 text-sm leading-relaxed" style={{ color: 'var(--soouls-accent)' }}>
                Your downloaded archive includes entries, settings, and insight summaries exactly as
                your account sees them.
              </p>
              <div className="mt-5 flex items-center gap-2 text-xs text-[var(--soouls-text-faint)]">
                <HardDrive className="h-4 w-4" />
                Your data belongs only to you.
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-8">
            <OutlineButton
              icon={<ArrowLeft className="h-4 w-4" />}
              onClick={() => router.push('/home')}
            >
              Back to Home
            </OutlineButton>
            <OutlineButton
              icon={
                deleteAccount.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )
              }
              onClick={handleDeleteAccount}
              danger
              disabled={deleteAccount.isPending}
            >
              Delete account
            </OutlineButton>
          </div>
        </section>
      </main>
    </div>
  );
}
