'use client';

import { useUser } from '@clerk/nextjs';
import type { UserEntry } from '@soouls/api/router';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  Check,
  CircleOff,
  LayoutGrid,
  Loader2,
  Mic,
  MoreVertical,
  Search,
  Sparkles,
  Trash2,
  User,
  X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useSidebar } from '../../src/providers/sidebar-provider';
import { decodeEntryContent, getEntryPlainText, getEntryTitle } from '../../src/utils/entries';
import { buildActivityBars, formatCurrentMonthRange } from '../../src/utils/home';
import { getOptimizedImageUrl } from '../../src/utils/images';
import { trpc } from '../../src/utils/trpc';
import { CanvasLoopIcon, LeafIcon } from '../components/Icons';
import { SymbolLogo } from '../components/SymbolLogo';
import { CalendarModal } from './components/CalendarModal';

function avatarFor(seed?: string | null) {
  return `https://api.dicebear.com/9.x/glass/svg?seed=${encodeURIComponent(seed || 'Soouls')}&backgroundColor=1c1c1c,var(--soouls-accent)&radius=50`;
}

function entryTitle(entry: UserEntry) {
  return getEntryTitle(entry);
}

type EntryPreviewBlock = {
  id?: string;
  type?: string;
  section?: number;
  dataUrl?: string;
  name?: string;
  isSticker?: boolean;
  isGif?: boolean;
  duration?: number;
  goal?: string;
  label?: string;
  content?: string;
  title?: string;
  tasks?: Array<{ id?: string; text?: string; done?: boolean }>;
};

function SearchPreview({ entry }: { entry?: UserEntry }) {
  if (!entry) {
    return (
      <div className="flex h-full flex-col items-center justify-center space-y-4 rounded-[16px] border border-white/5 bg-[#222222]/20 p-12 text-center backdrop-blur-2xl">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/[0.03] text-white/10">
          <Search className="h-10 w-10" />
        </div>
        <div className="max-w-[200px]">
          <p className="text-sm font-medium text-white/40 italic">Select an entry to reflect</p>
          <p className="mt-2 text-[10px] uppercase tracking-widest text-white/20">The preview will appear here</p>
        </div>
      </div>
    );
  }

  const text = getEntryPlainText(entry);
  let blocks: EntryPreviewBlock[] = [];
  try {
    const decoded = decodeEntryContent(entry.content);
    const parsed = JSON.parse(decoded) as { blocks?: EntryPreviewBlock[] };
    blocks = Array.isArray(parsed.blocks) ? parsed.blocks : [];
  } catch {
    blocks = [];
  }

  // Define components for the bento grid preview
  const BentoBlock = ({ children, className = '', title }: { children: React.ReactNode; className?: string; title?: string }) => (
    <div className={`relative overflow-hidden rounded-[16px] bg-[#222222] border border-white/[0.05] p-3 flex flex-col gap-2 ${className}`}>
      {title && (
        <span className="text-[8px] font-medium uppercase tracking-widest text-[#D8D8D8]/40 mb-1">
          {title}
        </span>
      )}
      {children}
    </div>
  );

  return (
    <div className="grid grid-cols-2 grid-rows-3 gap-3 h-full overflow-y-auto custom-scrollbar p-1">
      {/* 1. Main Text Block */}
      <BentoBlock className="col-span-1 row-span-1" title="Reflection">
        <p className="text-[10px] leading-relaxed text-[#D8D8D8] font-urbanist line-clamp-4">
          {text || "Silence is the space where your thoughts find their true voice..."}
        </p>
        <div className="mt-4 h-20 rounded bg-[linear-gradient(135deg,rgba(224,122,95,0.28),rgba(239,235,221,0.08))]" />
        <p className="mt-2 text-[10px] text-[#b7ff8d]">Entry preview</p>
      </BentoBlock>
      <div className="rounded-md bg-[#222] p-3">
        <div className="mb-3 h-8 rounded bg-[#1c1c1c]" />
        <p className="text-center text-xs text-[#7a7a7a]">Add more</p>
        <div className="mt-3 flex items-end gap-1">
          {[16, 24, 14, 28, 20, 12, 26, 18].map((height, index) => (
            <span key={index} className="w-2 rounded bg-[#e07a5f]" style={{ height }} />
          ))}
        </div>
      </div>

      {/* 4. Tasklist/Goals Block */}
      <BentoBlock className="col-span-1 row-span-1" title="Intentions">
        <div className="space-y-2">
          {blocks.find(b => b.type === 'tasklist')?.tasks?.slice(0, 3).map((t, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-[2px] border ${t.done ? 'bg-[#E07A5F] border-[#E07A5F]' : 'border-white/20'}`}>
                {t.done && <Check className="w-2.5 h-2.5 text-white" />}
              </div>
              <span className={`text-[8px] ${t.done ? 'text-white/20 line-through' : 'text-[#D8D8D8]/80'}`}>{t.text}</span>
            </div>
          )) || (
            <div className="py-4 text-center opacity-20">
               <span className="text-[8px] uppercase tracking-widest">No Tasks set</span>
            </div>
          )}
        </div>
        <p className="text-2xl text-[#e07a5f]">
          00:01:48 <span className="text-xs">pm</span>
        </p>
        <p className="mt-2 text-[10px] text-[#b7ff8d]">Goal set</p>
      </BentoBlock>
    </div>
  );
}

function SearchPopup({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const router = useRouter();
  const trpcContext = trpc.useContext();
  const deleteEntry = trpc.private.entries.delete.useMutation({
    onSuccess: async () => {
      await Promise.all([
        trpcContext.private.entries.getAll.invalidate(),
        trpcContext.private.entries.getGalaxy.invalidate(),
        trpcContext.private.home.getInsights.invalidate(),
        trpcContext.private.home.getClusters.invalidate(),
        trpcContext.private.home.getAccount.invalidate(),
      ]);
    },
  });

  const [debouncedQuery, setDebouncedQuery] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: searchResults, isLoading } = trpc.private.entries.getAll.useQuery(
    { search: debouncedQuery, limit: 12 },
    { enabled: true },
  );

  const items = searchResults?.items ?? [];
  const active = items[selected] ?? items[0];

  const handleEntryClick = (id: string) => {
    onClose();
    router.push(`/home/new-entry?id=${id}`);
  };

  const handleDelete = async (entry: UserEntry) => {
    if (!confirm(`Delete "${entryTitle(entry)}"?`)) return;
    try {
      await deleteEntry.mutateAsync({ id: entry.id });
      setSelected(0);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-2xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative flex h-[562px] w-[986px] overflow-hidden rounded-[16px] bg-[#0E0E0E]/50 shadow-[0_60px_120px_-20px_rgba(0,0,0,0.8)] backdrop-blur-[60px]"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex h-full w-full">
          {/* Left: Search & Navigation */}
          <div className="flex w-[550px] flex-col p-10 border-r border-[#A8A8A8]/10">
            {/* Search Input Area */}
            <div className="relative mb-12">
              <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-8 text-[#D8D8D8]" strokeWidth={1.5} />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelected(0);
                }}
                placeholder="Search or find entries"
                className="w-full bg-transparent py-4 pl-12 text-2xl font-medium text-[#D8D8D8] outline-none placeholder:text-[#D8D8D8]/30 font-urbanist"
              />
              <div className="absolute bottom-0 left-12 right-0 h-[1px] bg-[#A8A8A8]/30" />
            </div>

            <h3 className="text-[26px] font-urbanist text-[#D8D8D8] mb-6">Recent Entries</h3>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
              {items.map((entry, index) => (
                <button
                  key={entry.id}
                  onMouseEnter={() => setSelected(index)}
                  onClick={() => handleEntryClick(entry.id)}
                  className={`group relative flex w-full items-center justify-between rounded-[16px] bg-[#0F0F0F]/50 px-6 py-4 border border-[#222222] transition-all ${
                    selected === index ? 'bg-[#222222] border-white/10 shadow-2xl' : 'hover:bg-[#151515]'
                  }`}
                >
                  <span className="font-playfair text-[28px] text-[#EFEBDD] transition-colors">
                    {entryTitle(entry)}
                  </span>
                  <div className="flex items-center gap-4">
                    <span className="font-playfair text-base text-[#7A7A7A]">
                      {new Date(entry.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: '2-digit',
                        year: 'numeric'
                      }).toUpperCase()}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        void handleDelete(entry);
                      }}
                      className="p-2 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </button>
              ))}

              {!isLoading && items.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-sm text-white/20 italic">No entries found matching your search.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Hover Preview */}
          <div className="flex-1 bg-[#0F0F0F]/30 p-10">
             <div className="h-full relative">
                <AnimatePresence mode="wait">
                  {active ? (
                    <motion.div
                      key={active.id}
                      className="h-full"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <SearchPreview entry={active} />
                    </motion.div>
                  ) : (
                    <div className="flex h-full items-center justify-center opacity-10">
                      <SymbolLogo className="h-32 w-32" />
                    </div>
                  )}
                </AnimatePresence>
             </div>
          </div>
        </div>

        {/* Global Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-8 top-8 z-[110] rounded-2xl bg-white/[0.03] p-4 text-white/20 transition-all hover:bg-white/[0.08] hover:text-white/60 active:scale-95 border border-white/5"
        >
          <X className="h-5 w-5" />
        </button>
      </motion.div>
    </motion.div>
  );
}

export default function HomePage() {
  const { user } = useUser();
  const { setIsOpen } = useSidebar();
  const [scrolled, setScrolled] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const { data: insights } = trpc.private.home.getInsights.useQuery(undefined);
  const { data: entries } = trpc.private.entries.getAll.useQuery({ limit: 120, cursor: 0 });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const search = window.location.search;
    if (search.includes('gcal_connected=1') || search.includes('gcal_error=')) {
      setIsCalendarOpen(true);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const activityBars = buildActivityBars(entries?.items ?? []);
  const thoughtThemes = insights?.thoughtThemes ?? [];
  const coreThemes = insights?.coreThemes ?? [];
  const shiftMetrics = useMemo(() => {
    return (
      coreThemes.length
        ? coreThemes
        : thoughtThemes.map((theme) => ({ label: theme.label, percent: theme.progress }))
    )
      .slice(0, 4)
      .map((theme, index) => ({
        label: theme.label,
        icon:
          index === 0 ? (
            <ArrowUpRight className="h-4 w-4" style={{ color: 'var(--soouls-accent)' }} />
          ) : index === 1 ? (
            <ArrowDownRight className="h-4 w-4 text-white/40" />
          ) : index === 2 ? (
            <span
              className="rounded-full border px-2 py-0.5 text-[8px] tracking-widest"
              style={{
                borderColor: 'rgba(var(--soouls-accent-rgb),0.35)',
                color: 'var(--soouls-accent)',
              }}
            >
              EMERGING
            </span>
          ) : (
            <CircleOff className="h-4 w-4 text-white/30" />
          ),
      }));
  }, [coreThemes, thoughtThemes]);

  const avatarUrl =
    user?.imageUrl || avatarFor(user?.primaryEmailAddress?.emailAddress || user?.id);

  return (
    <div
      className="relative flex min-h-screen flex-col overflow-x-hidden"
      style={{ backgroundColor: 'var(--soouls-bg)', color: 'var(--soouls-text-strong)' }}
    >
      <div className="pointer-events-none absolute inset-0 select-none" aria-hidden="true">
        <Image
          src="/images/tree-bg.png"
          alt=""
          fill
          style={{ objectFit: 'cover', objectPosition: 'center', opacity: 0.46 }}
          priority={false}
        />
      </div>

      <header
        className={`fixed inset-x-0 top-0 z-50 flex items-center justify-between px-5 transition-all duration-300 md:px-12 ${scrolled ? 'border-b py-4 backdrop-blur-md' : 'bg-transparent py-6'}`}
        style={{
          backgroundColor: scrolled ? 'rgba(20,20,20,0.76)' : 'transparent',
          borderColor: scrolled ? 'var(--soouls-border)' : 'transparent',
        }}
      >
        <Link
          href="/home"
          className="relative flex h-8 w-24 items-center text-xl font-bold text-white"
        >
          Soouls
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/home/canvas"
            className="flex items-center gap-2.5 rounded-full border px-5 py-2.5 text-sm shadow-md"
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
            onClick={() => setIsOpen(true)}
            className="h-10 w-10 overflow-hidden rounded-full border-2 shadow-md"
            style={{
              backgroundColor: 'var(--soouls-bg-elevated)',
              borderColor: 'rgba(255,255,255,0.12)',
            }}
            aria-label="Open profile menu"
          >
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
          </button>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center">
        <section className="relative z-10 flex min-h-screen w-full max-w-[1600px] flex-col justify-center px-4 pb-20 md:px-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-[2.5rem] font-light leading-[1.08] tracking-tight text-white md:text-[3.5rem]"
          >
            You do not need clarity to start. <br className="hidden md:block" />
            Clarity comes after you{' '}
            <Link
              href="/home/new-entry"
              className="inline-flex items-center gap-1 font-playfair italic underline underline-offset-4"
              style={{ color: 'var(--soouls-accent)' }}
            >
              make entry
            </Link>
          </motion.h1>
        </section>

        <section className="relative z-10 mt-8 flex w-full max-w-[1600px] justify-center px-4 pb-28 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="w-full rounded-[2rem] p-4 md:p-8"
            style={{ backgroundColor: 'var(--soouls-bg-surface)' }}
          >
            <div className="mb-6 flex justify-end gap-2 text-[11px] font-medium tracking-wider text-[var(--soouls-text-faint)]">
              <Calendar className="h-3.5 w-3.5" />
              {formatCurrentMonthRange()}
            </div>
            <div
              className="mb-6 rounded-2xl p-7 md:p-10"
              style={{ backgroundColor: 'var(--soouls-bg-panel)' }}
            >
              <LeafIcon className="mb-6 h-5 w-5 text-[#86A861]" />
              <p className="font-playfair text-2xl italic leading-[1.25] text-[var(--soouls-text-strong)] md:text-5xl">
                "
                {insights?.monthlyQuote ??
                  'Your entries are beginning to show a more coherent direction.'}
                "
              </p>
              <p className="mt-6 max-w-5xl text-sm leading-relaxed text-[var(--soouls-text-muted)]">
                {insights
                  ? `You have ${insights.overview?.entryCount ?? 0} entries in your archive, ${insights.overview?.weeklyEntryCount ?? 0} entries this week, and a ${insights.overview?.currentStreak ?? 0}-day reflective streak.`
                  : 'Your home summary evolves from your real writing as soon as you start capturing entries.'}
              </p>
            </div>

            <div className="mb-6 grid gap-6 lg:grid-cols-2">
              <div
                className="rounded-2xl p-7"
                style={{ backgroundColor: 'var(--soouls-bg-panel)' }}
              >
                <h2 className="mb-8 text-base font-medium">Thought Themes</h2>
                <div className="space-y-5">
                  {thoughtThemes.length ? (
                    thoughtThemes.slice(0, 4).map((theme) => (
                      <div key={theme.key}>
                        <div className="mb-2 flex justify-between text-[10px] font-medium tracking-wider text-[var(--soouls-text-faint)]">
                          <span>{theme.label.toUpperCase()}</span>
                          <span>{theme.count} ENTRIES</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-black/50">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${theme.progress}%`,
                              background: 'linear-gradient(90deg,var(--soouls-accent),orange)',
                            }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="rounded-2xl border border-[var(--soouls-border)] p-5 text-sm text-[var(--soouls-text-muted)]">
                      Your theme graph will begin filling in after your first few real entries.
                    </p>
                  )}
                </div>
              </div>

              <div
                className="rounded-2xl p-7"
                style={{ backgroundColor: 'var(--soouls-bg-panel)' }}
              >
                <h2 className="mb-5 text-base font-medium">Reflection Patterns</h2>
                <p className="mb-8 text-sm leading-relaxed text-[var(--soouls-text-muted)]">
                  You tend to reflect most during{' '}
                  {insights?.overview?.mostActivePeriod ?? 'late evenings'}, when your thoughts
                  become more structured.
                </p>
                <div className="flex h-28 items-end justify-center gap-2 border-b border-white/10">
                  {(activityBars.length ? activityBars : [20, 34, 50, 70, 84, 64, 38])
                    .slice(0, 7)
                    .map((value, index) => {
                      return (
                        <span
                          key={index}
                          className="w-7 bg-[rgba(var(--soouls-accent-rgb),0.75)]"
                          style={{
                            height: `${Math.max(16, value)}%`,
                            opacity: 0.35 + index * 0.08,
                          }}
                        />
                      );
                    })}
                </div>
              </div>
            </div>

            <div className="mb-6 grid gap-6 lg:grid-cols-[0.8fr_1fr]">
              <div
                className="rounded-2xl p-7"
                style={{ backgroundColor: 'var(--soouls-bg-panel)' }}
              >
                <h2 className="text-base font-semibold">How your Thoughts connect</h2>
                <p className="mb-6 text-[10px] tracking-wider text-[var(--soouls-text-faint)]">
                  RELATIONSHIP MAP
                </p>
                <div className="relative h-56 overflow-hidden rounded bg-[#181818]">
                  {thoughtThemes.slice(0, 5).map((theme, index) => (
                    <span
                      key={theme.key}
                      className="absolute h-3 w-3 rounded-full bg-[#e8c7b4] shadow-[0_0_18px_rgba(224,122,95,0.8)]"
                      style={{ left: `${20 + index * 14}%`, top: `${25 + (index % 3) * 18}%` }}
                    />
                  ))}
                </div>
              </div>
              <div
                className="rounded-2xl p-7"
                style={{ backgroundColor: 'var(--soouls-bg-panel)' }}
              >
                <h2 className="text-base font-semibold">Your thinking is shifting</h2>
                <p className="mb-6 text-[10px] tracking-wider text-[var(--soouls-text-faint)]">
                  EVOLUTION CYCLE
                </p>
                <div className="space-y-4">
                  {shiftMetrics.map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="text-sm uppercase text-[var(--soouls-text-muted)]">
                        {item.label}
                      </span>
                      {item.icon}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div
              className="rounded-2xl p-8 text-center md:p-10"
              style={{ backgroundColor: 'var(--soouls-bg-panel)' }}
            >
              <LeafIcon className="mx-auto mb-6 h-6 w-6 text-[#86A861]" />
              <p
                className="mb-4 text-[11px] tracking-widest"
                style={{ color: 'var(--soouls-accent)' }}
              >
                FINAL SYNTHESIS
              </p>
              <p className="font-playfair text-2xl italic md:text-4xl">
                "
                {insights?.finalSynthesis?.headline ??
                  'Your writing suggests a meaningful transition is underway.'}
                "
              </p>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[var(--soouls-text-muted)]">
                This summary updates from your actual entries, settings, and reflective cadence.
              </p>
            </div>
          </motion.div>
        </section>
      </main>

      <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 flex w-full max-w-[1600px] -translate-x-1/2 items-center justify-between px-5 md:px-12">
        <button
          type="button"
          onClick={() => setIsSearchOpen(true)}
          className="pointer-events-auto flex items-center gap-3 rounded-full px-5 py-3 text-sm shadow-2xl"
          style={{ color: 'var(--soouls-text-muted)', backgroundColor: 'rgba(17,17,17,0.9)' }}
        >
          <Search className="h-[18px] w-[18px]" />
          <span className="hidden font-light tracking-wide sm:inline">Search Entries</span>
        </button>
        <Link
          href="/home"
          className="pointer-events-auto absolute left-1/2 flex -translate-x-1/2 items-center justify-center text-[#BDBBAF] transition-colors hover:text-white"
        >
          <SymbolLogo className="h-14 w-14" variant="solid" />
        </Link>
        <button
          type="button"
          onClick={() => setIsCalendarOpen(true)}
          className="pointer-events-auto flex items-center gap-3 rounded-full border px-5 py-3 text-sm text-white shadow-[0_0_25px_rgba(212,107,78,0.15)]"
          style={{
            backgroundColor: 'rgba(17,17,17,0.9)',
            borderColor: 'rgba(var(--soouls-accent-rgb),0.4)',
          }}
        >
          <Calendar className="h-5 w-5" />
          <span className="hidden font-medium tracking-wide sm:inline">Calendar</span>
        </button>
      </div>

      <AnimatePresence>
        {isSearchOpen && <SearchPopup onClose={() => setIsSearchOpen(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {isCalendarOpen && <CalendarModal onClose={() => setIsCalendarOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}
