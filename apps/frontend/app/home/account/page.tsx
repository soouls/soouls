'use client';

import type { UserEntry } from '@soouls/api/router';
import { UserButton, useAuth, useClerk, useUser } from '@clerk/nextjs';
import {
  ArrowLeft,
  Calendar,
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
  User,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { downloadJson } from '../../../src/utils/home';
import { getTRPCClient, trpc } from '../../../src/utils/trpc';

const FONT_PLAYFAIR = "'Playfair Display', Georgia, serif";
const FONT_URBANIST = "'Urbanist', system-ui, sans-serif";

function StatCard({
  value,
  label,
  icon,
}: {
  value: string | number;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl border p-6 flex flex-col gap-4 min-h-[120px] justify-between"
      style={{
        fontFamily: FONT_URBANIST,
        backgroundColor: 'var(--soouls-bg-surface)',
        borderColor: 'var(--soouls-border)',
      }}
    >
      <div className="flex items-start justify-between">
        <span className="text-5xl font-bold leading-none" style={{ color: 'var(--soouls-accent)' }}>
          {value}
        </span>
        <span style={{ color: 'var(--soouls-accent)' }}>{icon}</span>
      </div>
      <p className="text-base font-medium text-[var(--soouls-text-muted)]">{label}</p>
    </div>
  );
}

function Tag({ label }: { label: string }) {
  return (
    <span
      className="inline-block rounded-full border px-4 py-1.5 text-sm"
      style={{
        borderColor: 'rgba(255,255,255,0.15)',
        color: 'var(--soouls-text-muted)',
        fontFamily: FONT_URBANIST,
      }}
    >
      {label}
    </span>
  );
}

function ThemeBar({ label, percent }: { label: string; percent: number }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="font-medium text-sm" style={{ color: 'var(--soouls-accent)', fontFamily: FONT_URBANIST }}>
        {label}
      </span>
      <span className="text-sm text-[var(--soouls-text-muted)]" style={{ fontFamily: FONT_URBANIST }}>
        {percent} %
      </span>
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
      className="flex items-center gap-2.5 rounded-full border px-6 py-3 text-sm font-medium transition-all duration-200 disabled:opacity-50"
      style={{
        borderColor: danger ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255,255,255,0.15)',
        color: danger ? '#f87171' : 'var(--soouls-text-muted)',
        fontFamily: FONT_URBANIST,
      }}
    >
      {icon}
      {children}
    </button>
  );
}

function DataActionBtn({
  children,
  icon,
  onClick,
  loading = false,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  onClick: () => void;
  loading?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="flex flex-1 items-center gap-3 rounded-2xl border px-5 py-4 text-sm font-medium transition-all duration-200 hover:bg-white/5 disabled:opacity-60"
      style={{
        backgroundColor: 'var(--soouls-bg-surface)',
        borderColor: 'var(--soouls-border)',
        color: 'var(--soouls-text-muted)',
        fontFamily: FONT_URBANIST,
      }}
    >
      <span style={{ color: 'var(--soouls-accent)' }}>
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      </span>
      {children}
    </button>
  );
}

export default function AccountPage() {
  const router = useRouter();
  const { user } = useUser();
  const { getToken } = useAuth();
  const { signOut } = useClerk();
  const trpcClient = useMemo(() => getTRPCClient(getToken), [getToken]);

  const [exporting, setExporting] = useState<'all' | 'entries' | null>(null);

  const { data: account } = trpc.private.home.getAccount.useQuery(undefined);
  const { data: insights } = trpc.private.home.getInsights.useQuery(undefined);
  const { data: settings } = trpc.private.home.getSettings.useQuery(undefined);

  const deleteAccount = trpc.private.home.deleteAccount.useMutation({
    onSuccess: async () => {
      await signOut({ redirectUrl: '/' });
    },
  });

  const displayName = user?.fullName || user?.firstName || 'Unknownname';
  const email = user?.primaryEmailAddress?.emailAddress || 'you@example.com';
  const avatarUrl = user?.imageUrl;

  const loadAllEntries = async (): Promise<UserEntry[]> => {
    const items: UserEntry[] = [];
    let cursor: number | null = 0;

    while (cursor !== null) {
      const response = await trpcClient.private.entries.getAll.query({
        cursor,
        limit: 200,
      });
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

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'This will permanently delete your Soouls account and journal data. This cannot be undone. Continue?',
    );
    if (!confirmed) return;
    deleteAccount.mutate();
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--soouls-bg)', color: 'var(--soouls-text-strong)', fontFamily: FONT_URBANIST }}>
      <header className="px-8 py-6 flex items-center justify-between border-b" style={{ borderColor: 'var(--soouls-border)' }}>
        <div className="flex items-center gap-4">
          <Link href="/home" className="flex items-center gap-2 text-[var(--soouls-text-muted)] hover:text-[var(--soouls-text-strong)] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Home
          </Link>
          <span className="text-[var(--soouls-text-faint)]">/</span>
          <span className="text-lg" style={{ color: 'var(--soouls-accent)' }}>
            Account
          </span>
        </div>
        <UserButton
          appearance={{
            elements: {
              avatarBox: 'h-9 w-9 ring-2 ring-white/10 hover:ring-white/20 transition-all',
            },
          }}
          afterSignOutUrl="/"
        />
      </header>

      <main className="max-w-4xl mx-auto px-8 py-10 space-y-6 pb-16">
        <div className="rounded-2xl border p-6" style={{ backgroundColor: 'var(--soouls-bg-surface)', borderColor: 'var(--soouls-border)' }}>
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex items-start gap-5 flex-1">
              <div className="relative flex-shrink-0">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={displayName} className="h-20 w-20 rounded-full object-cover ring-2" style={{ ['--tw-ring-color' as string]: 'rgba(var(--soouls-accent-rgb), 0.3)' }} />
                ) : (
                  <div
                    className="h-20 w-20 rounded-full flex items-center justify-center ring-2"
                    style={{
                      background: 'linear-gradient(135deg, rgba(var(--soouls-accent-rgb), 0.45), rgba(var(--soouls-accent-rgb), 0.2))',
                      ['--tw-ring-color' as string]: 'rgba(var(--soouls-accent-rgb), 0.2)',
                    }}
                  >
                    <User className="w-8 h-8" style={{ color: 'var(--soouls-accent)' }} />
                  </div>
                )}
                <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-emerald-400 ring-2" style={{ ['--tw-ring-color' as string]: 'var(--soouls-bg-surface)' }} />
              </div>

              <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5">
                <h2 className="text-4xl leading-none" style={{ fontFamily: FONT_PLAYFAIR, fontStyle: 'italic', fontWeight: 600 }}>
                  {displayName}
                </h2>
                <p className="text-base" style={{ color: 'var(--soouls-accent)' }}>
                  {email}
                </p>
                <div className="text-base text-[var(--soouls-text-muted)] mt-0.5">
                  {account?.bio ?? 'Trying to make sense of my thoughts.'}
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 text-sm font-semibold">
                    {account?.consistencyMessage ?? "You're building momentum."}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full sm:w-1/2">
              <StatCard value={account?.stats.daysJoined ?? 0} label="Days Joined" icon={<Calendar className="w-6 h-6" />} />
              <StatCard value={account?.stats.entries ?? 0} label="Entries" icon={<PenLine className="w-6 h-6" />} />
              <StatCard value={account?.stats.streak ?? 0} label="Day Streak" icon={<Flame className="w-6 h-6" />} />
              <StatCard value={account?.stats.mostActivePeriod ?? '—'} label="Most Active" icon={<Moon className="w-6 h-6" />} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3 rounded-2xl border p-6 space-y-4" style={{ backgroundColor: 'var(--soouls-bg-surface)', borderColor: 'var(--soouls-border)' }}>
            <p className="font-semibold text-base text-[var(--soouls-text-strong)]">Your writing patterns</p>
            <p className="text-xs uppercase tracking-[0.18em] font-medium text-[var(--soouls-text-faint)]">Primary Style</p>
            <h3 className="text-3xl leading-tight" style={{ fontFamily: FONT_PLAYFAIR, fontStyle: 'italic', fontWeight: 600 }}>
              {account?.writingProfile.title ?? insights?.writingProfile.title ?? 'Thoughtful self-reflection'}
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--soouls-accent)' }}>
              {account?.writingProfile.description ??
                insights?.writingProfile.description ??
                'Your entries are grounding emotion in language and turning reflection into clarity.'}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {(account?.writingProfile.tags ?? insights?.writingProfile.tags ?? ['Reflective']).map((tag) => (
                <Tag key={tag} label={tag} />
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 rounded-2xl border p-6 space-y-3" style={{ backgroundColor: 'var(--soouls-bg-surface)', borderColor: 'var(--soouls-border)' }}>
            <p className="font-semibold text-base text-[var(--soouls-text-strong)]">Insight Analysis</p>
            <p className="text-xs uppercase tracking-[0.18em] font-medium text-[var(--soouls-text-faint)]">Core Theme</p>
            <div className="divide-y divide-white/5">
              {(account?.coreThemes ?? insights?.coreThemes ?? []).slice(0, 3).map((theme) => (
                <ThemeBar key={theme.label} label={theme.label} percent={theme.percent} />
              ))}
            </div>
            <p className="text-xs leading-relaxed pt-2 text-center text-[var(--soouls-text-faint)]">
              Insights are based on your real entry cadence, recurring themes, and tone patterns.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3 rounded-2xl border p-6 space-y-4" style={{ backgroundColor: 'var(--soouls-bg-surface)', borderColor: 'var(--soouls-border)' }}>
            <p className="font-semibold text-base text-[var(--soouls-text-strong)]">Data &amp; Ownership</p>
            <div className="flex gap-3">
              <DataActionBtn icon={<Download className="w-4 h-4" />} onClick={handleExportAll} loading={exporting === 'all'}>
                Download your data
              </DataActionBtn>
              <DataActionBtn icon={<Upload className="w-4 h-4" />} onClick={handleBackupEntries} loading={exporting === 'entries'}>
                Backup your entries
              </DataActionBtn>
            </div>
          </div>

          <div className="lg:col-span-2 rounded-2xl border p-6 space-y-3" style={{ backgroundColor: 'var(--soouls-bg-surface)', borderColor: 'var(--soouls-border)' }}>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <p className="font-semibold text-sm text-emerald-400">Privacy Snapshot</p>
            </div>
            <p className="text-lg leading-snug" style={{ fontFamily: FONT_PLAYFAIR, fontStyle: 'italic', fontWeight: 600 }}>
              Your privacy comes first.
            </p>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--soouls-accent)' }}>
              Your data is stored for your own reflective experience and exported exactly as your account sees it.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <HardDrive className="w-3.5 h-3.5 text-[var(--soouls-text-faint)]" />
              <span className="text-xs text-[var(--soouls-text-faint)]">
                Your downloaded archive includes entries, settings, and insight summaries.
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2 flex-wrap">
          <OutlineButton icon={<ArrowLeft className="w-4 h-4" />} onClick={() => router.push('/home')}>
            Back to Home
          </OutlineButton>
          <OutlineButton
            icon={deleteAccount.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            onClick={handleDeleteAccount}
            danger
            disabled={deleteAccount.isPending}
          >
            Delete account
          </OutlineButton>
        </div>
      </main>
    </div>
  );
}
