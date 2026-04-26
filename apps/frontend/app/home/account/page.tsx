'use client';

import { useUser } from '@clerk/nextjs';
import {
  ArrowLeft,
  Calendar,
  Download,
  Flame,
  HardDrive,
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
    </div>
  );
}

function Tag({ label }: { label: string }) {
  return (
    <span
      className="inline-block rounded-full border border-white/10 px-5 py-1.5 text-sm text-white/60 hover:text-white hover:border-white/20 transition-all cursor-default"
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
      </span>
    </div>
  );
}

export default function AccountPage() {
  const { user } = useUser();
  const router = useRouter();
  const { setIsOpen } = useSidebar();

  const displayName = user?.fullName || user?.firstName || 'Unknownname';
  const email = user?.primaryEmailAddress?.emailAddress || 'you@example.com';
  const avatarUrl = user?.imageUrl;

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;1,600&family=Urbanist:wght@300;400;500;600&display=swap"
        rel="stylesheet"
      />

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
                  </div>
                </div>
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
  );
}
