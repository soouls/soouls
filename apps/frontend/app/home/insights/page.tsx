'use client';

import { useUser } from '@clerk/nextjs';
import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  Home as HomeIcon,
  Moon,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Zap,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useSidebar } from '../../../src/providers/sidebar-provider';
import { buildActivityBars, formatCurrentMonthRange } from '../../../src/utils/home';
import { trpc } from '../../../src/utils/trpc';
import { CanvasLoopIcon, LeafIcon } from '../../components/Icons';

const RELATION_POINTS = [
  { top: '18%', left: '20%' },
  { top: '50%', left: '48%' },
  { top: '72%', left: '30%' },
  { top: '42%', left: '78%' },
];

function avatarFor(seed?: string | null) {
  return `https://api.dicebear.com/9.x/glass/svg?seed=${encodeURIComponent(seed || 'Soouls')}&backgroundColor=1c1c1c,e07a5f&radius=50`;
}

export default function InsightsPage() {
  const { user } = useUser();
  const { setIsOpen } = useSidebar();
  const [scrolled, setScrolled] = useState(false);

  const { data: insights } = trpc.private.home.getInsights.useQuery(undefined);
  const { data: entries } = trpc.private.entries.getAll.useQuery({ limit: 120, cursor: 0 });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const thoughtThemes = insights?.thoughtThemes ?? [];
  const coreThemes = insights?.coreThemes ?? [];
  const activityBars = buildActivityBars(entries?.items ?? []);
  const avatarUrl = user?.imageUrl || avatarFor(user?.primaryEmailAddress?.emailAddress || user?.id);

  return (
    <div className="min-h-screen bg-[#1F1F1F] text-white flex flex-col relative overflow-hidden font-urbanist select-none">
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
      <header className="fixed top-0 left-0 right-0 z-50 p-8 flex justify-between items-center bg-transparent">
        <div className="flex items-center gap-4">
          <Link
            href="/home/canvas"
            className="flex items-center gap-2.5 rounded-full border px-5 py-2.5 text-sm shadow-md transition-all hover:scale-105 active:scale-95"
            style={{
              backgroundColor: 'rgba(17,17,17,0.86)',
              borderColor: 'var(--soouls-border)',
              color: 'var(--soouls-text-muted)',
            }}
          >
            <CanvasLoopIcon className="h-[18px] w-[18px]" />
            <span className="hidden font-medium tracking-wide sm:inline">Canvas</span>
          </Link>
          <button
            type="button"
            onClick={() => typeof window !== 'undefined' && window.history.back()}
            className="text-white/40 hover:text-white transition-colors"
          >
            <HomeIcon className="h-5 w-5" />
          </button>
          <span className="text-white/20">/</span>
          <span className="text-[#D46B4E]">Insights</span>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="w-10 h-10 rounded-full border-2 border-white/10 hover:border-white/30 transition-all cursor-pointer overflow-hidden"
        >
          {user?.imageUrl && (
            <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
          )}
        </button>
      </header>

      <main className="flex-1 w-full max-w-[1600px] mx-auto px-6 md:px-12 relative z-10 flex flex-col mt-12 pb-0 items-stretch h-full">
        <div className="flex-1 rounded-t-[32px] bg-[#0F0F0F]/60 backdrop-blur-[48px] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex flex-col relative border-t border-white/10 p-8 md:p-12 pb-32 overflow-y-auto custom-scrollbar">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
            <h2 className="text-2xl font-medium tracking-tight text-white/90">
              Soulcanvas Insights
            </h2>
            <div className="flex items-center gap-2 text-xs tracking-wider uppercase font-semibold text-white/40">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatCurrentMonthRange()}</span>
            </div>
          </div>

          <div className="mb-16">
            <div className="flex gap-4 mb-6">
              <Sparkles className="w-6 h-6 shrink-0 text-[#D46B4E]" />
              <div className="space-y-4">
                <blockquote className="text-3xl md:text-4xl font-urbanist font-light leading-[1.3] text-white/90">
                  “
                  {insights?.monthlyNarrative ??
                    'Your recent writing is starting to reveal a clearer pattern.'}
                  ”
                </blockquote>
                <p className="text-[15px] leading-relaxed max-w-2xl font-light text-white/60">
                  {insights
                    ? `You've written ${insights.overview.entryCount} entries so far, with ${insights.overview.weeklyEntryCount} showing up this week. Your most active reflective window is ${insights.overview.mostActivePeriod.toLowerCase()}.`
                    : 'Your entry rhythm, themes, and timing are being analyzed as you write.'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="border border-white/5 bg-black/20 p-8 rounded-3xl backdrop-blur-md shadow-inner">
              <h3 className="text-[13px] font-semibold tracking-wider mb-8 uppercase text-white/60">
                Thought Themes
              </h3>
              <div className="space-y-10">
                {thoughtThemes.length > 0 ? (
                  thoughtThemes.slice(0, 4).map((theme) => (
                    <div key={theme.key}>
                      <div className="flex justify-between text-[10px] tracking-widest font-bold mb-3">
                        <span className="text-white/40">
                          {theme.label.toUpperCase()}
                        </span>
                        <span className="text-[#D46B4E]">{theme.count} ENTRIES</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full overflow-hidden bg-white/10">
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{
                            width: `${theme.progress}%`,
                            background:
                              'linear-gradient(90deg, #D46B4E, rgba(212,107,78, 0.35))',
                          }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-white/5 bg-black/20 px-4 py-5 text-[14px] leading-relaxed text-white/60 shadow-inner">
                    Your insight themes will appear here once you have a few saved entries.
                  </div>
                )}
              </div>
            </div>

            <div className="border border-white/5 bg-black/20 p-8 rounded-3xl backdrop-blur-md shadow-inner">
              <h3 className="text-[13px] font-semibold tracking-wider mb-6 uppercase text-white/60">
                Reflection Patterns
              </h3>
              <div className="flex gap-4 mb-10">
                <Moon className="w-5 h-5 shrink-0 text-[#D46B4E]" />
                <p className="text-[13px] leading-relaxed font-light text-white/60">
                  You tend to reflect most during{' '}
                  <span className="text-white/90 font-normal">
                    {insights?.overview.mostActivePeriod ?? 'Evenings'}
                  </span>
                  , when your thoughts gather more shape and language.
                </p>
              </div>

              <div className="flex items-end justify-between h-32 gap-2.5 px-2">
                {activityBars.map((height, index) => (
                  <div
                    key={`${height}-${index}`}
                    className="w-full rounded-full transition-all duration-1000 shadow-lg"
                    style={{
                      height: `${height}%`,
                      backgroundColor:
                        index === activityBars.indexOf(Math.max(...activityBars))
                          ? '#D46B4E'
                          : 'rgba(255,255,255,0.1)',
                    }}
                  />
                ))}
              </div>
              <div className="flex justify-between text-[8px] mt-3 tracking-widest uppercase font-bold text-white/40">
                <span>Morning</span>
                <span>Midnight</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="border border-white/5 bg-black/20 p-8 rounded-3xl flex flex-col backdrop-blur-md shadow-inner">
              <h3 className="text-[13px] font-semibold tracking-wider mb-2 uppercase text-white/60">
                How your Thoughts connect
              </h3>
              <span className="text-[10px] tracking-widest mb-10 uppercase text-white/40">
                RELATIONS BY SIMILARITY
              </span>
              <div className="flex-1 flex items-center justify-center relative min-h-[220px]">
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none opacity-20"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="0.5"
                >
                  <line x1="20%" y1="20%" x2="48%" y2="50%" />
                  <line x1="48%" y1="50%" x2="30%" y2="72%" />
                  <line x1="48%" y1="50%" x2="78%" y2="42%" />
                </svg>
                {(coreThemes.slice(0, 4).length
                  ? coreThemes.slice(0, 4)
                  : [{ label: 'Reflection', percent: 100 }]
                ).map((theme, index) => {
                  const point = RELATION_POINTS[index] ?? { top: '50%', left: '50%' };
                  const size =
                    index === 1 ? 'w-5 h-5' : index === 2 ? 'w-3 h-3' : 'w-4 h-4';
                  return (
                    <div key={theme.label}>
                      <div
                        className={`absolute rounded-full shadow-[0_0_10px_rgba(212,107,78,0.5)] ${size}`}
                        style={{
                          top: point.top,
                          left: point.left,
                          backgroundColor:
                            index <= 1
                              ? '#D46B4E'
                              : 'rgba(212,107,78, 0.55)',
                        }}
                      />
                      <span
                        className="absolute text-[8px] tracking-widest text-white/40"
                        style={{
                          top: `calc(${point.top} - 24px)`,
                          left: `calc(${point.left} - 12px)`,
                        }}
                      >
                        {theme.label.toUpperCase()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border border-white/5 bg-black/20 p-8 rounded-3xl backdrop-blur-md shadow-inner">
              <h3 className="text-[13px] font-semibold tracking-wider mb-2 uppercase text-white/60">
                Your thinking is shifting
              </h3>
              <span className="text-[10px] tracking-widest mb-10 uppercase text-white/40">
                EVOLUTION STATUS
              </span>
              <div className="space-y-8">
                {(coreThemes.length
                  ? coreThemes
                  : thoughtThemes
                      .slice(0, 3)
                      .map((theme) => ({ label: theme.label, percent: theme.progress }))
                )
                  .slice(0, 4)
                  .map((theme, index) => (
                    <div key={theme.label} className="flex justify-between items-center">
                      <span className="text-[10px] tracking-wider font-bold uppercase text-white/60">
                        {theme.label}
                      </span>
                      <div className="flex items-center gap-3">
                        {index === 0 && (
                          <ArrowUpRight
                            className="w-3 h-3 text-[#D46B4E]"
                          />
                        )}
                        {index === 1 && <ArrowDownRight className="w-3 h-3 text-white/40" />}
                        {index === 2 && (
                          <span
                            className="text-[9px] px-2 py-0.5 rounded border font-bold tracking-widest text-[#D46B4E]"
                            style={{
                              backgroundColor: 'rgba(212,107,78, 0.15)',
                              borderColor: 'rgba(212,107,78, 0.28)',
                            }}
                          >
                            EMERGING
                          </span>
                        )}
                        {index > 2 && <Target className="w-4 h-4 text-white/30" />}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="pt-12 border-t border-white/5 mt-8">
            <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
              <Sparkles className="w-6 h-6 mb-6 text-[#D46B4E]" />
              <span
                className="text-[10px] font-bold tracking-[0.3em] mb-4 uppercase text-[#D46B4E]"
              >
                Final Synthesis
              </span>
              <h4 className="text-2xl md:text-3xl font-urbanist font-light leading-[1.3] mb-4 text-white/90">
                “
                {insights?.finalSynthesis ??
                  'Your writing suggests a meaningful transition is underway.'}
                ”
              </h4>
              <p className="text-[14px] leading-relaxed font-light text-white/60">
                These insights update from your real entries, not placeholders, so they evolve as
                your writing evolves.
              </p>
            </div>
          </div>
        </div>
      </main>

      <div
        className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none"
        style={{ backgroundColor: 'rgba(212,107,78, 0.08)' }}
      />
      <div
        className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none"
        style={{ backgroundColor: 'rgba(212,107,78, 0.06)' }}
      />
    </div>
  );
}
