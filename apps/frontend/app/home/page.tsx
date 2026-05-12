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
  Moon,
  MoreVertical,
  RefreshCw,
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
import { ConfirmModal } from '../components/ConfirmModal';
import { CalendarModal } from './components/CalendarModal';

function avatarFor(seed?: string | null) {
  return `https://api.dicebear.com/9.x/glass/svg?seed=${encodeURIComponent(seed || 'Soouls')}&backgroundColor=1c1c1c,var(--soouls-accent)&radius=50`;
}

/* ─────────── tiny SVG icons from Insights ─────────── */
const SoulLeafIcon = () => (
  <svg
    aria-hidden="true"
    width="48"
    height="48"
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M46.4309 8.97949C46.4095 8.61252 46.2541 8.2662 45.9941 8.00628C45.7342 7.74635 45.3879 7.59092 45.0209 7.56949C35.3159 7.00699 27.5234 9.95824 24.1747 15.4857C21.9622 19.1401 21.9659 23.5782 24.1447 27.812C22.9044 29.2882 21.998 31.0151 21.4878 32.8745L18.4372 29.8126C19.9034 26.7507 19.8472 23.5595 18.2497 20.9082C15.7747 16.8226 10.0616 14.6326 2.96842 15.0489C2.60146 15.0703 2.25514 15.2257 1.99521 15.4857C1.73529 15.7456 1.57986 16.0919 1.55842 16.4589C1.1403 23.552 3.33218 29.2651 7.4178 31.7401C8.76597 32.564 10.3153 33 11.8953 33.0001C13.4288 32.9811 14.9385 32.6178 16.3128 31.937L21.0003 36.6245V42.0001C21.0003 42.3979 21.1583 42.7795 21.4396 43.0608C21.7209 43.3421 22.1025 43.5001 22.5003 43.5001C22.8981 43.5001 23.2797 43.3421 23.561 43.0608C23.8423 42.7795 24.0003 42.3979 24.0003 42.0001V36.4707C23.9935 34.0844 24.8056 31.768 26.3009 29.9082C28.2302 30.9166 30.3699 31.4561 32.5466 31.4832C34.651 31.49 36.7164 30.9151 38.5147 29.822C44.0422 26.477 47.0009 18.6845 46.4309 8.97949ZM8.96468 29.1751C6.08843 27.4332 4.46093 23.3101 4.5003 18.0001C9.8103 17.9551 13.9334 19.5882 15.6753 22.4645C16.5847 23.9645 16.7328 25.7139 16.1365 27.5157L11.5597 22.9389C11.2761 22.6694 10.8985 22.5214 10.5073 22.5265C10.1162 22.5315 9.74246 22.6891 9.46586 22.9657C9.18926 23.2423 9.03165 23.616 9.02664 24.0071C9.02163 24.3983 9.16962 24.7759 9.43905 25.0595L14.0159 29.6364C12.2141 30.2326 10.4666 30.0845 8.96468 29.1751ZM36.9603 27.2589C34.4478 28.7795 31.4947 28.8957 28.4947 27.6339L38.5616 17.5651C38.831 17.2815 38.979 16.9039 38.974 16.5128C38.969 16.1216 38.8113 15.7479 38.5347 15.4713C38.2581 15.1947 37.8844 15.0371 37.4933 15.0321C37.1021 15.0271 36.7245 15.1751 36.4409 15.4445L26.3722 25.5001C25.1047 22.5001 25.219 19.5451 26.7472 17.0345C29.3609 12.722 35.5597 10.3182 43.4966 10.5039C43.6766 18.4389 41.2766 24.6451 36.9603 27.2589Z"
      fill="#B7FF8D"
    />
  </svg>
);

const MoonZzzIcon = () => (
  <svg
    aria-hidden="true"
    width="32"
    height="32"
    viewBox="0 0 28 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M14 21a8 8 0 0 1-5-14.3 8 8 0 0 0 9.3 11.3A8 8 0 0 1 14 21z"
      fill="var(--soouls-accent)"
    />
    <path
      d="M19 11h2.5l-2.5 3h2.5"
      stroke="var(--soouls-accent)"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M23 6h2l-2 2.5h2"
      stroke="var(--soouls-accent)"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const TrendUpIcon = () => (
  <svg
    aria-hidden="true"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="var(--soouls-accent)"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
);

const TrendDownIcon = () => (
  <svg
    aria-hidden="true"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="var(--soouls-accent)"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
    <polyline points="16 17 22 17 22 11" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg
    aria-hidden="true"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="var(--soouls-accent)"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

function SectionCard({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[20px] border border-[rgba(255,255,255,0.04)] p-[32px] flex flex-col ${className}`}
      style={{ backgroundColor: 'var(--soouls-bg-panel)' }}
    >
      {children}
    </section>
  );
}

function parseHighlightedText(text: string | undefined | null, fallback: string) {
  if (!text) return fallback;
  const parts = text.split(/(\{ts[12]\}.*?\{\/ts[12]\})/g);

  return parts.map((part, i) => {
    if (part.startsWith('{ts1}')) {
      const innerText = part.replace(/\{ts1\}/g, '').replace(/\{\/ts1\}/g, '');
      return (
        <span key={i} style={{ color: 'var(--soouls-accent)' }}>
          {innerText}
        </span>
      );
    }
    if (part.startsWith('{ts2}')) {
      const innerText = part.replace(/\{ts2\}/g, '').replace(/\{\/ts2\}/g, '');
      return (
        <strong key={i} className="text-[#f0ece6] font-semibold">
          {innerText}
        </strong>
      );
    }
    return part;
  });
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
          <p className="mt-2 text-[10px] uppercase tracking-widest text-white/20">
            The preview will appear here
          </p>
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
  const BentoBlock = ({
    children,
    className = '',
    title,
  }: { children: React.ReactNode; className?: string; title?: string }) => (
    <div
      className={`relative overflow-hidden rounded-[16px] bg-[#222222] border border-white/[0.05] p-3 flex flex-col gap-2 ${className}`}
    >
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
          {text || 'Silence is the space where your thoughts find their true voice...'}
        </p>
        <div className="mt-4 h-20 rounded bg-[linear-gradient(135deg,rgba(224,122,95,0.28),rgba(239,235,221,0.08))]" />
        <p className="mt-2 text-[10px] text-[#b7ff8d]">Entry preview</p>
      </BentoBlock>
      <div className="rounded-md bg-[#222] p-3">
        <div className="mb-3 h-8 rounded bg-[#1c1c1c]" />
        <p className="text-center text-xs text-[#7a7a7a]">Add more</p>
        <div className="mt-3 flex items-end gap-1">
          {[16, 24, 14, 28, 20, 12, 26, 18].map((height, index) => (
            <span
              key={index}
              className="w-2 rounded bg-[var(--soouls-accent)]"
              style={{ height }}
            />
          ))}
        </div>
      </div>

      {/* 4. Tasklist/Goals Block */}
      <BentoBlock className="col-span-1 row-span-1" title="Intentions">
        <div className="space-y-2">
          {blocks
            .find((b) => b.type === 'tasklist')
            ?.tasks?.slice(0, 3)
            .map((t, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-[2px] border ${t.done ? 'bg-[var(--soouls-accent)] border-[var(--soouls-accent)]' : 'border-white/20'}`}
                >
                  {t.done && <Check className="w-2.5 h-2.5 text-white" />}
                </div>
                <span
                  className={`text-[8px] ${t.done ? 'text-white/20 line-through' : 'text-[#D8D8D8]/80'}`}
                >
                  {t.text}
                </span>
              </div>
            )) || (
            <div className="py-4 text-center opacity-20">
              <span className="text-[8px] uppercase tracking-widest">No Tasks set</span>
            </div>
          )}
        </div>
        <p className="text-2xl text-[var(--soouls-accent)]">
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
  const [entryToDelete, setEntryToDelete] = useState<UserEntry | null>(null);

  const deleteEntry = trpc.private.entries.delete.useMutation({
    onSuccess: async () => {
      await Promise.all([
        trpcContext.private.entries.getAll.invalidate(),
        trpcContext.private.entries.getGalaxy.invalidate(),
        trpcContext.private.home.getInsights.invalidate(),
        trpcContext.private.home.getClusters.invalidate(),
        trpcContext.private.home.getAccount.invalidate(),
      ]);
      setEntryToDelete(null);
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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setSelected((current) => Math.min(items.length - 1, current + 1));
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setSelected((current) => Math.max(0, current - 1));
      }
      if (event.key === 'Enter' && active) {
        handleEntryClick(active.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [active, items.length, onClose]);

  const handleEntryClick = (id: string) => {
    onClose();
    router.push(`/home/new-entry?id=${id}`);
  };

  const confirmDelete = async () => {
    if (!entryToDelete) return;
    try {
      await deleteEntry.mutateAsync({ id: entryToDelete.id });
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
        className="relative flex overflow-hidden rounded-[16px] bg-[#0E0E0E]/70 shadow-[0_60px_120px_-20px_rgba(0,0,0,0.8)] backdrop-blur-[30px]"
        style={{
          width: 'min(986px, calc(100vw - 32px))',
          height: 'min(562px, calc(100vh - 32px))',
        }}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex h-full w-full flex-col md:flex-row">
          {/* Left: Search & Navigation */}
          <div className="flex h-[58%] w-full flex-col border-b border-[#A8A8A8]/10 p-5 sm:p-7 md:h-full md:w-[550px] md:border-b-0 md:border-r md:p-10">
            {/* Search Input Area */}
            <div className="relative mb-12">
              <Search
                className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-8 text-[#D8D8D8]"
                strokeWidth={1.5}
              />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelected(0);
                }}
                placeholder="Search or find entries"
                className="w-full bg-transparent py-4 pl-12 text-xl font-medium text-[#D8D8D8] outline-none placeholder:text-[#D8D8D8]/30 font-urbanist sm:text-2xl"
              />
              <div className="absolute bottom-0 left-12 right-0 h-[1px] bg-[#A8A8A8]/30" />
            </div>

            <h3 className="mb-5 text-[22px] font-urbanist text-[#D8D8D8] sm:mb-6 sm:text-[26px]">
              Recent Entries
            </h3>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
              {items.map((entry, index) => (
                <button
                  key={entry.id}
                  type="button"
                  onMouseEnter={() => setSelected(index)}
                  onClick={() => handleEntryClick(entry.id)}
                  className={`group relative flex w-full items-center justify-between gap-4 rounded-[16px] bg-[#0F0F0F]/50 px-4 py-3 border border-[#222222] transition-all sm:px-6 sm:py-4 ${
                    selected === index
                      ? 'bg-[#222222] border-white/10 shadow-2xl'
                      : 'hover:bg-[#151515]'
                  }`}
                >
                  <span className="min-w-0 truncate font-playfair text-[21px] text-[#EFEBDD] transition-colors sm:text-[28px]">
                    {entryTitle(entry)}
                  </span>
                  <div className="flex shrink-0 items-center gap-2 sm:gap-4">
                    <span className="font-playfair text-xs text-[#7A7A7A] sm:text-base">
                      {new Date(entry.createdAt)
                        .toLocaleDateString('en-US', {
                          month: 'short',
                          day: '2-digit',
                          year: 'numeric',
                        })
                        .toUpperCase()}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEntryToDelete(entry);
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
                  <p className="text-sm text-white/20 italic">
                    No entries found matching your search.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Hover Preview */}
          <div className="min-h-0 flex-1 bg-[#0F0F0F]/30 p-5 sm:p-7 md:p-10">
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
          className="absolute right-4 top-4 z-[110] rounded-2xl bg-white/[0.03] p-3 text-white/30 transition-all hover:bg-white/[0.08] hover:text-white/70 active:scale-95 border border-white/5 sm:right-8 sm:top-8 sm:p-4"
        >
          <X className="h-5 w-5" />
        </button>
      </motion.div>

      <ConfirmModal
        isOpen={!!entryToDelete}
        onClose={() => setEntryToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete entry?"
        description={
          <>
            Are you sure you want to delete <br />
            <span className="text-white">"{entryToDelete ? entryTitle(entryToDelete) : ''}"</span>?
            <br />
            This action cannot be undone.
          </>
        }
        confirmText="Delete Entry"
        confirmStyle="danger"
        isPending={deleteEntry.isPending}
      />
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
  const refreshInsights = trpc.private.home.refreshInsights.useMutation();
  const utils = trpc.useContext();

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

  const thoughtThemes = insights?.thoughtThemes ?? [];

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
            <div className="flex justify-between items-center mb-6 px-2">
              <div className="flex justify-end gap-2 text-[11px] font-medium tracking-wider text-[var(--soouls-text-faint)]">
                <Calendar className="h-3.5 w-3.5" />
                {formatCurrentMonthRange()}
              </div>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await refreshInsights.mutateAsync({});
                    await utils.private.home.getInsights.invalidate();
                  } catch (err) {
                    console.error('Refresh failed:', err);
                  }
                }}
                className="flex items-center gap-[6px] px-[14px] py-[6px] rounded-full border text-[11px] font-medium tracking-[0.04em] uppercase transition-all duration-300 cursor-pointer hover:shadow-[0_0_16px_rgba(var(--soouls-accent-rgb),0.3)]"
                style={{
                  borderColor: 'var(--soouls-accent)',
                  color: 'var(--soouls-accent)',
                  backgroundColor: 'rgba(var(--soouls-accent-rgb),0.06)',
                }}
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${refreshInsights.isPending ? 'animate-spin' : ''}`}
                  strokeWidth={2}
                />
                {refreshInsights.isPending ? 'Refreshing…' : 'Refresh'}
              </button>
            </div>

            <SectionCard className="mb-6">
              <div className="flex justify-between items-start mb-[24px]">
                <SoulLeafIcon />
                {insights?.previousTheme && insights?.dominantTheme && (
                  <div className="text-[10px] tracking-[0.1em] text-[rgba(240,236,230,0.4)] uppercase font-medium">
                    {insights.previousTheme} <span className="mx-1">→</span>{' '}
                    <span className="text-[var(--soouls-accent)]">{insights.dominantTheme}</span>
                  </div>
                )}
              </div>

              <p className="font-playfair text-[32px] font-semibold italic leading-[1.2] mb-[24px] text-[#f0ece6] tracking-[-0.01em]">
                &ldquo;{parseHighlightedText(insights?.monthlyQuote, '')}&rdquo;
              </p>

              <div className="space-y-4">
                {insights?.monthlyAnalysis && (
                  <p className="text-[14px] leading-[1.65] font-light text-[rgba(240,236,230,0.55)] max-w-[95%] tracking-wide">
                    {parseHighlightedText(insights.monthlyAnalysis, '')}
                  </p>
                )}

                {insights?.statLine && (
                  <div className="pt-2">
                    <p className="text-[14px] font-medium text-[#f0ece6] mb-1">
                      {insights.statLine}
                    </p>
                    <p className="text-[13px] font-light text-[rgba(240,236,230,0.4)] italic">
                      {insights.statNote}
                    </p>
                  </div>
                )}
              </div>
            </SectionCard>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <SectionCard>
                <h2 className="text-[24px] font-light tracking-[-0.01em] text-[#f0ece6] mb-[36px] font-sans">
                  Thought Themes
                </h2>
                {thoughtThemes.length === 0 ? (
                  <p className="text-[13px] font-light text-[rgba(240,236,230,0.35)] italic">
                    Write more entries to reveal your thought themes.
                  </p>
                ) : (
                  <div className="space-y-[26px] flex-1 flex flex-col justify-end">
                    {thoughtThemes.slice(0, 4).map((t, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between text-[11px] font-medium tracking-wider text-[rgba(240,236,230,0.45)]">
                          <span>{t.label.toUpperCase()}</span>
                          <span>{t.progress}%</span>
                        </div>
                        <div className="h-[10px] rounded-full overflow-hidden bg-[#3c241a]">
                          <div
                            className="h-full rounded-full transition-all duration-1000"
                            style={{
                              width: `${t.progress}%`,
                              background:
                                i === 0
                                  ? 'linear-gradient(90deg, var(--soouls-accent), var(--soouls-accent))'
                                  : i === 1
                                    ? '#8b5e34'
                                    : '#5c3d2e',
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>

              <SectionCard className="justify-between">
                <div>
                  <h2 className="text-[24px] font-light tracking-[-0.01em] text-[#f0ece6] mb-[32px] font-sans">
                    Reflection Patterns
                  </h2>
                  <div className="flex items-start gap-[16px]">
                    <div className="mt-[2px] shrink-0 opacity-90">
                      <MoonZzzIcon />
                    </div>
                    <p className="text-[15px] leading-[1.5] font-light text-[rgba(240,236,230,0.65)]">
                      You tend to reflect most during{' '}
                      {(insights?.overview?.mostActivePeriod || 'late night').toLowerCase()}s
                    </p>
                  </div>

                  <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[rgba(var(--soouls-accent-rgb),0.4)] to-transparent my-[24px]" />

                  {insights?.reflectionToneDescription ? (
                    <p className="text-[12px] italic leading-[1.65] text-[rgba(240,236,230,0.35)] text-center max-w-[95%] mx-auto">
                      &ldquo;{insights.reflectionToneDescription}&rdquo;
                    </p>
                  ) : (
                    <p className="text-[12px] italic leading-[1.65] text-[rgba(240,236,230,0.25)] text-center">
                      Write more entries to see patterns.
                    </p>
                  )}
                </div>

                {/* Histogram placeholder to match style */}
                <div className="flex items-end justify-center h-[80px] w-full mt-[36px] gap-1">
                  {(insights?.reflectionHistogram || []).slice(0, 9).map((slot, i) => {
                    const height = slot.count > 0 ? Math.max(8, slot.percentage) : 4;
                    const colors = [
                      '#2a1610',
                      '#3c1d14',
                      '#7a3b2b',
                      '#b85840',
                      'var(--soouls-accent)',
                      '#b85840',
                      '#7a3b2b',
                      '#3c1d14',
                      '#2a1610',
                    ];
                    return (
                      <div
                        key={i}
                        className="flex-1 max-w-[32px] transition-all duration-700"
                        style={{
                          height: `${height}%`,
                          backgroundColor: colors[i % colors.length],
                          opacity: 0.4 + (height / 100) * 0.6,
                        }}
                      />
                    );
                  })}
                </div>
              </SectionCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <SectionCard>
                <h2 className="text-[24px] font-light tracking-[-0.01em] text-[#f0ece6] mb-[6px] font-sans">
                  How your Thoughts connect
                </h2>
                <p className="text-[11px] font-light tracking-[0.06em] text-[rgba(240,236,230,0.6)] uppercase mb-[32px]">
                  Relationship Map
                </p>

                <div className="relative w-full h-[200px] flex items-center justify-center bg-[#181818] rounded-lg overflow-hidden">
                  <svg aria-hidden="true" width="100%" height="100%" viewBox="0 0 300 200">
                    <defs>
                      <filter id="glow-node">
                        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                        <feMerge>
                          <feMergeNode in="coloredBlur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>

                    {(insights?.relationshipMap?.links || []).map((link, i) => {
                      const nodes = insights?.relationshipMap?.nodes || [];
                      const sourceNode = nodes.find((n) => n.id === link.source);
                      const targetNode = nodes.find((n) => n.id === link.target);
                      if (!sourceNode || !targetNode) return null;

                      const sIdx = nodes.indexOf(sourceNode);
                      const tIdx = nodes.indexOf(targetNode);

                      const x1 = 50 + (sIdx % 3) * 100;
                      const y1 = 50 + Math.floor(sIdx / 3) * 80;
                      const x2 = 50 + (tIdx % 3) * 100;
                      const y2 = 50 + Math.floor(tIdx / 3) * 80;

                      return (
                        <line
                          key={i}
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke="rgba(var(--soouls-accent-rgb),0.15)"
                          strokeWidth={link.strength * 2}
                        />
                      );
                    })}

                    {(insights?.relationshipMap?.nodes || []).map((node, i) => {
                      const x = 50 + (i % 3) * 100;
                      const y = 50 + Math.floor(i / 3) * 80;
                      const radius = Math.max(5, node.size);
                      const color = i % 2 === 0 ? 'var(--soouls-accent)' : 'var(--soouls-accent)';

                      return (
                        <g key={node.id}>
                          <circle
                            cx={x}
                            cy={y}
                            r={radius}
                            fill={color}
                            filter="url(#glow-node)"
                            opacity={0.8}
                          />
                          <circle cx={x} cy={y} r={radius / 2} fill="#ffebd2" />
                          <text
                            x={x}
                            y={y + radius + 12}
                            fill="rgba(255,255,255,0.4)"
                            fontSize="9"
                            fontWeight="300"
                            textAnchor="middle"
                            letterSpacing="0.05em"
                            className="uppercase"
                          >
                            {node.label}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </SectionCard>

              <SectionCard>
                <h2 className="text-[24px] font-light tracking-[-0.01em] text-[#f0ece6] mb-[6px] font-sans">
                  Your thinking is shifting
                </h2>
                <p className="text-[11px] font-light tracking-[0.06em] text-[rgba(240,236,230,0.6)] uppercase mb-[36px]">
                  Evolution Cycle
                </p>

                <div className="space-y-[24px] flex-1 flex flex-col justify-center px-2 pb-2">
                  {(insights?.thinkingShifts || []).length === 0 ? (
                    <p className="text-[13px] font-light text-[rgba(240,236,230,0.35)] italic">
                      More entries needed for trend analysis.
                    </p>
                  ) : (
                    (insights?.thinkingShifts || []).map((item, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <span className="text-[13px] font-light text-[rgba(240,236,230,0.6)] uppercase tracking-[0.02em]">
                          {item.label}
                        </span>
                        {item.trend === 'up' && <TrendUpIcon />}
                        {item.trend === 'down' && <TrendDownIcon />}
                        {item.tag === 'EMERGING' && (
                          <div
                            className="px-[12px] py-[4px] rounded-full border border-[var(--soouls-accent)] text-[var(--soouls-accent)] text-[10px] font-light tracking-[0.04em]"
                            style={{
                              boxShadow:
                                '0 0 12px rgba(var(--soouls-accent-rgb),0.25), inset 0 0 4px rgba(var(--soouls-accent-rgb),0.1)',
                            }}
                          >
                            EMERGING
                          </div>
                        )}
                        {item.trend === 'circle' && <CheckCircleIcon />}
                      </div>
                    ))
                  )}
                </div>
              </SectionCard>
            </div>

            <SectionCard className="relative flex flex-col items-center text-center py-[80px] px-[64px]">
              <div className="absolute top-[32px] left-[32px]">
                <SoulLeafIcon />
              </div>
              <p className="text-[28px] md:text-[32px] font-semibold tracking-[-0.035em] mb-[32px] uppercase text-[var(--soouls-accent)] font-sans">
                FINAL SYNTHESIS
              </p>
              <p className="font-playfair text-[38px] md:text-[48px] font-semibold italic leading-[1.1] mb-[32px] text-[#f0ece6] tracking-[-0.035em] max-w-[95%]">
                &ldquo;{insights?.finalSynthesis?.headline || ''}&rdquo;
              </p>
              <p className="text-[18px] md:text-[20px] leading-[1.6] font-light text-[rgba(240,236,230,0.55)] max-w-[800px] tracking-wide">
                {insights?.finalSynthesis?.body || ''}
              </p>
            </SectionCard>
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
