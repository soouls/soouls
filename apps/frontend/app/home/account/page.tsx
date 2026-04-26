'use client';

import { useUser } from '@clerk/nextjs';
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
  Sparkles,
  CloudSun,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSidebar } from '../../../src/providers/sidebar-provider';
import { useMemo, useState } from 'react';
import { downloadJson } from '../../../src/utils/home';
import { getTRPCClient, trpc } from '../../../src/utils/trpc';

const FONT_PLAYFAIR = "'Playfair Display', Georgia, serif";
const FONT_URBANIST = "'Urbanist', system-ui, sans-serif";

function StatCard({
  value,
  label,
  icon,
  className = '',
}: {
  value: string | number;
  label: string;
  icon: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[24px] bg-[#141414] border border-white/5 p-6 flex items-start justify-between min-h-[140px] group hover:border-[#D46B4E]/30 transition-all duration-300 ${className}`}
    >
      <div className="flex flex-col h-full justify-between">
        <span className="text-5xl font-semibold text-[#E07A5F]/90 tracking-tight leading-none">
          {value}
        </span>
        <p className="text-white/40 text-sm font-medium tracking-wide uppercase">{label}</p>
      </div>
      <div className="text-[#D46B4E] opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
        {icon}
      </div>
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
      className="inline-block rounded-full border border-white/10 px-5 py-1.5 text-sm text-white/60 hover:text-white hover:border-white/20 transition-all cursor-default"
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
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-b-0">
      <span className="text-[#60A5FA] font-medium text-base">
        {label}
      </span>
      <span className="text-white/40 text-sm font-semibold">
        {percent}%
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

      <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-[#D46B4E]/30 relative overflow-hidden" style={{ fontFamily: FONT_URBANIST }}>

        {/* Watermark Background */}
        <div className="absolute top-10 left-0 right-0 flex justify-center pointer-events-none opacity-[0.07] select-none z-0 overflow-hidden whitespace-nowrap">
          <span
            className="text-[22vw] leading-none text-transparent tracking-tighter"
            style={{
              fontFamily: FONT_PLAYFAIR,
              WebkitTextStroke: '1px rgba(255,255,255,0.8)',
            }}
          >
            Soouls in
          </span>
        </div>

        {/* Header */}
        <header className="px-8 py-6 flex items-center justify-between relative z-20">
          <div className="flex items-center gap-3">
            <Link
              href="/home"
              className="text-white/40 hover:text-white transition-colors text-base"
            >
              Home
            </Link>
            <span className="text-white/20">/</span>
            <span className="text-[#D46B4E] text-base font-medium">Account</span>
          </div>
          <button
            onClick={() => setIsOpen(true)}
            className="w-10 h-10 rounded-full ring-2 ring-white/10 hover:ring-[#D46B4E]/50 transition-all overflow-hidden"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
            ) : (
              <User className="w-5 h-5 text-white/60 mx-auto" />
            )}
          </button>
        </header>

        <main className="max-w-6xl mx-auto px-8 pt-4 pb-24 relative z-10 space-y-4">

          {/* Top Profile + Stats Card */}
          <div className="rounded-[32px] bg-[#111111]/80 backdrop-blur-xl border border-white/5 p-8 md:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

              {/* Profile Info */}
              <div className="lg:col-span-6 flex flex-col md:flex-row items-center md:items-start gap-8">
                <div className="relative flex-shrink-0 group">
                  <div className="absolute -inset-1 bg-gradient-to-br from-[#D46B4E] to-amber-600 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="h-32 w-32 rounded-full object-cover relative ring-4 ring-[#111111]"
                    />
                  ) : (
                    <div className="h-32 w-32 rounded-full bg-[#1A1A1A] flex items-center justify-center relative ring-4 ring-[#111111]">
                      <User className="w-12 h-12 text-white/20" />
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 h-6 w-6 rounded-full bg-emerald-500 ring-4 ring-[#111111]" />
                </div>

                <div className="flex-1 text-center md:text-left space-y-2">
                  <p className="text-white/40 text-sm font-medium tracking-widest uppercase mb-1">Your Profile</p>
                  <h2
                    className="text-5xl text-white tracking-tight"
                    style={{ fontFamily: FONT_PLAYFAIR, fontStyle: 'italic', fontWeight: 600 }}
                  >
                    {displayName}
                  </h2>
                  <p className="text-[#D46B4E] text-lg font-medium">{email}</p>
                  <p className="text-white/50 text-base max-w-sm">
                    Trying to make sense of my thoughts.
                  </p>
                  <div className="flex items-center justify-center md:justify-start gap-2 pt-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 text-sm font-medium">
                      You&apos;ve been staying consistent.
                    </span>
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

              {/* Stats Grid */}
              <div className="lg:col-span-6 grid grid-cols-2 gap-4">
                <StatCard value={32} label="Days Joined" icon={<Calendar className="w-6 h-6" />} />
                <StatCard value={64} label="Entries" icon={<PenLine className="w-6 h-6" />} />
                <StatCard value={9} label="Day Streak" icon={<Flame className="w-6 h-6" />} />
                <StatCard
                  value="Evenings"
                  label="Most Active"
                  icon={<CloudSun className="w-6 h-6" />}
                />
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

          {/* Patterns + Analysis Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

            {/* Writing Patterns */}
            <div className="lg:col-span-8 rounded-[32px] bg-[#111111]/80 backdrop-blur-xl border border-white/5 p-8 flex flex-col justify-center">
              <div className="space-y-6">
                <div>
                  <p className="text-white/50 font-medium text-base mb-1">Your writing patterns</p>
                  <p className="text-white/20 text-xs uppercase tracking-widest font-bold">
                    Primary Style
                  </p>
                </div>
                <h3
                  className="text-5xl text-white leading-[1.1] max-w-xl"
                  style={{ fontFamily: FONT_PLAYFAIR, fontStyle: 'italic', fontWeight: 600 }}
                >
                  Thoughtful self-reflection
                </h3>
                <p className="text-[#D46B4E]/80 text-lg leading-relaxed max-w-2xl">
                  You often pause to process your emotions before responding. Your entries show a
                  pattern of careful observation and internal clarity-building.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Tag label="Reflective" />
                  <Tag label="Aware" />
                  <Tag label="Grounded" />
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

            {/* Insight Analysis */}
            <div className="lg:col-span-4 rounded-[32px] bg-[#111111]/80 backdrop-blur-xl border border-white/5 p-8 flex flex-col">
              <div className="mb-6">
                <p className="text-white/50 font-medium text-base mb-1">Insight Analysis</p>
                <p className="text-white/20 text-xs uppercase tracking-widest font-bold">
                  Core Theme
                </p>
              </div>
              <div className="space-y-2 mb-8">
                <ThemeBar label="Healing" percent={41} />
                <ThemeBar label="Anxiety" percent={26} />
                <ThemeBar label="Self-worth" percent={17} />
              </div>
              <p className="text-white/30 text-xs leading-relaxed text-center mt-auto">
                Insights are based on sentiment and tone analysis.
              </p>
            </div>
          </div>

          {/* Ownership + Privacy Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

            {/* Data & Ownership */}
            <div className="lg:col-span-8 rounded-[32px] bg-[#111111]/80 backdrop-blur-xl border border-white/5 p-8">
              <p className="text-white/50 font-medium text-base mb-6">Data &amp; Ownership</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="flex-1 flex items-center justify-center gap-3 rounded-2xl bg-white/5 border border-white/5 px-6 py-4 text-white/80 hover:bg-white/10 hover:border-white/20 transition-all group">
                  <Download className="w-5 h-5 text-[#D46B4E] group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Download your data</span>
                </button>
                <button className="flex-1 flex items-center justify-center gap-3 rounded-2xl bg-white/5 border border-white/5 px-6 py-4 text-white/80 hover:bg-white/10 hover:border-white/20 transition-all group">
                  <Upload className="w-5 h-5 text-[#D46B4E] group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Backup your entries</span>
                </button>
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

            {/* Privacy Snapshot */}
            <div className="lg:col-span-4 rounded-[32px] bg-[#111111]/80 backdrop-blur-xl border border-white/5 p-8 space-y-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-400" />
                <p className="text-emerald-400 font-bold text-sm tracking-wider uppercase">Privacy Snapshot</p>
              </div>
              <p
                className="text-white text-3xl leading-tight"
                style={{ fontFamily: FONT_PLAYFAIR, fontStyle: 'italic', fontWeight: 600 }}
              >
                Your privacy comes first.
              </p>
              <p className="text-[#D46B4E]/70 text-sm leading-relaxed">
                Your data is encrypted end-to-end and used only to generate your personal insights.
                We don&apos;t share, sell, or use it for ads.
              </p>
              <div className="flex items-center gap-2 pt-2 opacity-40">
                <HardDrive className="w-4 h-4" />
                <span className="text-xs font-medium">Your data belongs only to you.</span>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-wrap items-center gap-4 pt-8">
            <button
              onClick={() => router.push('/home')}
              className="flex items-center gap-3 rounded-full border border-white/10 px-8 py-3 text-white/60 font-medium hover:bg-white/5 hover:text-white transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </button>
            <button className="flex items-center gap-3 rounded-full border border-red-500/20 px-8 py-3 text-red-500/60 font-medium hover:bg-red-500/10 hover:text-red-500 transition-all group">
              <div className="w-4 h-4 rounded-full border-2 border-red-500/40 flex items-center justify-center group-hover:border-red-500 transition-colors">
                <div className="w-1.5 h-1.5 bg-red-500/40 rounded-full group-hover:bg-red-500 transition-colors"></div>
              </div>
              Delete account
            </button>
          </div>

        </main>
      </div>
    </>
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
