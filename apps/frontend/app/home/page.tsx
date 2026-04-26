'use client';

import { useClerk, useUser } from '@clerk/nextjs';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  CircleOff,
  LayoutGrid,
  LogOut,
  Search,
  Settings,
  Sparkles,
  User,
  UserCircle,
  X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { SymbolLogo } from '../components/SymbolLogo';
import { buildActivityBars, formatCurrentMonthRange } from '../../src/utils/home';
import { CalendarModal } from './components/CalendarModal';
import { trpc } from '../../src/utils/trpc';

import {
  LeafIcon,
  DiamondIcon,
  CanvasLoopIcon,
  CompassIcon,
  NetworkIcon,
} from '../components/Icons';
import { useSidebar } from '../../src/providers/sidebar-provider';
const LeafIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
  </svg>
);

const DiamondIcon = ({ className }: { className?: string }) => (
  <LayoutGrid className={className} />
);

const CanvasLoopIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 12C9.5 8 5 8 5 12C5 16 9.5 16 12 12Z" />
    <path d="M12 12C14.5 8 19 8 19 12C19 16 14.5 16 12 12Z" />
    <path d="M12 12C8 9.5 8 5 12 5C16 5 16 9.5 12 12Z" />
    <path d="M12 12C8 14.5 8 19 12 19C16 19 16 14.5 12 12Z" />
  </svg>
);

export default function HomePage() {
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useClerk();
  const { setIsOpen } = useSidebar();
  const [scrolled, setScrolled] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const { data: insights } = trpc.private.home.getInsights.useQuery(undefined);
  const { data: account } = trpc.private.home.getAccount.useQuery(undefined);
  const { data: entries } = trpc.private.entries.getAll.useQuery({ limit: 120, cursor: 0 });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const search = window.location.search;
      if (search.includes('gcal_connected=1') || search.includes('gcal_error=')) {
        setIsCalendarOpen(true);
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, []);

  const userName = user?.firstName || user?.fullName?.split(' ')[0] || 'Explorer';
  const activityBars = buildActivityBars(entries?.items ?? []);
  const coreThemes = insights?.coreThemes ?? [];
  const thoughtThemes = insights?.thoughtThemes ?? [];

  const shiftMetrics = useMemo(() => {
    return (coreThemes.length ? coreThemes : thoughtThemes.map((theme) => ({ label: theme.label, percent: theme.progress })))
      .slice(0, 4)
      .map((theme, index) => ({
        label: theme.label,
        icon:
          index === 0 ? (
            <ArrowUpRight className="w-4 h-4" style={{ color: 'var(--soouls-accent)' }} />
          ) : index === 1 ? (
            <ArrowDownRight className="w-4 h-4 text-white/40" />
          ) : index === 2 ? (
            <span
              className="text-[8px] tracking-widest px-2 py-0.5 rounded-full"
              style={{
                border: '1px solid rgba(var(--soouls-accent-rgb), 0.35)',
                color: 'var(--soouls-accent)',
                backgroundColor: 'rgba(var(--soouls-accent-rgb), 0.12)',
              }}
            >
              EMERGING
            </span>
          ) : (
            <CircleOff className="w-4 h-4 text-white/30" />
          ),
      }));
  }, [coreThemes, thoughtThemes]);

  return (
    <div className="min-h-screen relative overflow-x-hidden flex flex-col" style={{ backgroundColor: 'var(--soouls-bg)', color: 'var(--soouls-text-strong)' }}>
      <div className="absolute inset-0 pointer-events-none select-none" style={{ zIndex: 0 }} aria-hidden="true">
        <Image src="/images/tree-bg.png" alt="" fill style={{ objectFit: 'cover', objectPosition: 'center', opacity: 0.46 }} priority={false} />
      </div>

      <header
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 transition-all duration-300 w-full ${
          scrolled ? 'py-4 backdrop-blur-md shadow-lg border-b' : 'py-6 bg-transparent'
        }`}
        style={{
          backgroundColor: scrolled ? 'rgba(20,20,20,0.76)' : 'transparent',
          borderColor: scrolled ? 'var(--soouls-border)' : 'transparent',
        }}
      >
        <Link href="/home" className="relative flex items-center h-8 w-24">
          <AnimatePresence mode="wait">
            {!scrolled ? (
              <motion.span
                key="text"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="absolute text-xl font-bold tracking-tight text-white"
              >
                Soouls
              </motion.span>
            ) : (
              <motion.div
                key="logo"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute text-white"
              >
                <SymbolLogo className="w-8 h-8 text-[#BDBBAF]" variant="solid" />
              </motion.div>
            )}
          </AnimatePresence>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/home/canvas"
            className="flex items-center gap-2.5 px-5 py-2.5 rounded-full border text-sm transition-all shadow-md"
            style={{
              backgroundColor: 'rgba(17,17,17,0.86)',
              borderColor: 'var(--soouls-border)',
              color: 'var(--soouls-text-muted)',
            }}
          >
            <CanvasLoopIcon className="w-[18px] h-[18px]" />
            <span className="font-medium tracking-wide">Canvas</span>
          </Link>

          <button
            onClick={() => setIsOpen(true)}
            className="w-10 h-10 rounded-full bg-[#1A1A1A] border-2 border-white/10 flex items-center justify-center overflow-hidden hover:border-white/30 transition-all cursor-pointer shadow-md"
            onClick={() => setShowSidebar(true)}
            className="w-10 h-10 rounded-full border-2 flex items-center justify-center overflow-hidden transition-all cursor-pointer shadow-md"
            style={{
              backgroundColor: 'var(--soouls-bg-elevated)',
              borderColor: 'rgba(255,255,255,0.12)',
            }}
          >
            {user?.imageUrl ? (
              <img src={user.imageUrl} alt="" className="w-full h-full object-cover rounded-full" />
            ) : (
              <User className="w-5 h-5 text-white/60" />
            )}
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center">
        <section className="relative z-10 px-4 md:px-6 lg:px-8 pt-32 pb-64 md:pb-80 w-full max-w-[1600px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1 }}
            className="w-full"
          >
            <h1 className="text-[2.5rem] md:text-[3.5rem] leading-[1.1] font-light text-white tracking-tight">
              You do not need clarity to start. <br className="hidden md:block" />
              Clarity comes after you{' '}
              <Link href="/home/new-entry" className="font-playfair italic transition-colors relative inline-flex items-center gap-1.5" style={{ color: 'var(--soouls-accent)' }}>
                <span className="relative">
                  make entry
                  <span className="absolute left-0 right-0 -bottom-1 h-[1px]" style={{ backgroundColor: 'rgba(var(--soouls-accent-rgb), 0.45)' }} />
                </span>
              </Link>
            </h1>
          </motion.div>
        </section>

        <section className="relative z-10 px-4 md:px-6 lg:px-8 pb-16 mt-20 md:mt-32 flex justify-center w-full max-w-[1600px]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="w-full rounded-[2rem] p-4 md:p-8 relative"
            style={{
              backgroundColor: 'var(--soouls-bg-surface)',
            }}
          >
            <div className="absolute top-8 right-10 flex items-center gap-2 text-[11px] font-medium tracking-wider text-[var(--soouls-text-faint)]">
              <Calendar className="w-3.5 h-3.5" />
              {formatCurrentMonthRange()}
            </div>

            <div className="rounded-2xl p-8 mb-6 mt-8" style={{ backgroundColor: 'var(--soouls-bg-panel)' }}>
              <LeafIcon className="w-5 h-5 mb-6 text-[#86A861]" />
              <p className="text-2xl md:text-3xl leading-[1.3] font-light tracking-tight text-[var(--soouls-text-strong)]">
                “{insights?.monthlyNarrative ?? 'Your entries are beginning to show a more coherent direction.'}”
              </p>
              <p className="mt-6 text-sm leading-relaxed font-light text-[var(--soouls-text-muted)]">
                {insights
                  ? `You have ${insights.overview.entryCount} entries in your archive, ${insights.overview.weeklyEntryCount} entries this week, and a ${insights.overview.currentStreak}-day reflective streak.`
                  : 'Your home summary evolves from your real writing as soon as you start capturing entries.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="rounded-2xl p-8 flex flex-col justify-between min-h-[220px]" style={{ backgroundColor: 'var(--soouls-bg-panel)' }}>
                <h3 className="text-[15px] mb-8 font-medium text-[var(--soouls-text-strong)]">Thought Themes</h3>
                <div className="space-y-5">
                  {thoughtThemes.length > 0 ? (
                    thoughtThemes.slice(0, 4).map((theme) => (
                      <div key={theme.key}>
                        <div className="flex justify-between text-[10px] mb-2 font-medium tracking-wider text-[var(--soouls-text-faint)]">
                          <span>{theme.label.toUpperCase()}</span>
                          <span>{theme.count} ENTRIES</span>
                        </div>
                        <div className="h-2 rounded-full bg-black/50 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${theme.progress}%`,
                              background:
                                'linear-gradient(90deg, var(--soouls-accent), rgba(var(--soouls-accent-rgb), 0.28))',
                            }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div
                      className="rounded-2xl border px-4 py-5 text-sm leading-relaxed"
                      style={{
                        borderColor: 'var(--soouls-border)',
                        backgroundColor: 'var(--soouls-overlay-subtle)',
                        color: 'var(--soouls-text-muted)',
                      }}
                    >
                      Your theme graph will begin filling in after your first few real entries.
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl p-8 flex flex-col justify-between min-h-[220px]" style={{ backgroundColor: 'var(--soouls-bg-panel)' }}>
                <h3 className="text-[15px] mb-5 font-medium text-[var(--soouls-text-strong)]">Reflection Patterns</h3>
                <div className="flex gap-4 mb-4">
                  <Sparkles className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--soouls-accent)' }} />
                  <p className="text-sm leading-relaxed font-light text-[var(--soouls-text-muted)]">
                    You tend to reflect most during{' '}
                    <span className="font-medium text-[var(--soouls-text-strong)]">
                      {insights?.overview.mostActivePeriod ?? 'Evenings'}
                    </span>
                    , when your thoughts feel more structured and available.
                  </p>
                </div>

                <div className="flex items-end justify-center gap-[2px] h-12 mt-auto">
                  {activityBars.map((height, index) => (
                    <div
                      key={`${height}-${index}`}
                      className="w-6 rounded-t-sm"
                      style={{
                        height: `${height}%`,
                        backgroundColor:
                          index === activityBars.indexOf(Math.max(...activityBars))
                            ? 'var(--soouls-accent)'
                            : 'var(--soouls-graph-fill)',
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="rounded-2xl p-8 flex flex-col justify-between min-h-[220px]" style={{ backgroundColor: 'var(--soouls-bg-panel)' }}>
                <h3 className="text-[15px] mb-1 font-medium text-[var(--soouls-text-strong)]">
                  How your Thoughts connect
                </h3>
                <p className="text-[10px] tracking-wider mb-6 text-[var(--soouls-text-faint)]">RELATIONSHIP MAP</p>

                <div
                  className="relative h-32 w-full rounded-xl overflow-hidden flex items-center justify-center"
                  style={{ backgroundColor: 'var(--soouls-overlay-subtle)' }}
                >
                  <svg className="absolute inset-0 w-full h-full opacity-30" pointerEvents="none">
                    <line x1="20%" y1="30%" x2="40%" y2="70%" stroke="var(--soouls-accent)" strokeWidth="1" />
                    <line x1="40%" y1="70%" x2="60%" y2="80%" stroke="var(--soouls-accent)" strokeWidth="1" />
                    <line x1="60%" y1="80%" x2="80%" y2="40%" stroke="var(--soouls-accent)" strokeWidth="1" />
                    <line x1="40%" y1="70%" x2="80%" y2="40%" stroke="var(--soouls-accent)" strokeWidth="1" opacity="0.5" />
                  </svg>

                  {(coreThemes.slice(0, 4).length ? coreThemes.slice(0, 4) : [{ label: 'Reflection', percent: 100 }]).map((theme, index) => {
                    const positions = [
                      { left: '20%', top: '30%' },
                      { left: '40%', top: '70%' },
                      { left: '60%', top: '80%' },
                      { left: '80%', top: '40%' },
                    ][index] ?? { left: '50%', top: '50%' };
                    return (
                      <div
                        key={theme.label}
                        className="absolute rounded-full"
                        style={{
                          left: positions.left,
                          top: positions.top,
                          width: index === 1 ? 12 : index === 2 ? 16 : 8,
                          height: index === 1 ? 12 : index === 2 ? 16 : 8,
                          backgroundColor:
                            index >= 2 ? 'rgba(var(--soouls-accent-rgb), 0.7)' : 'var(--soouls-accent)',
                          boxShadow: '0 0 15px rgba(var(--soouls-accent-rgb), 0.55)',
                        }}
                      >
                        <span className="absolute -top-4 -left-2 text-[8px] tracking-widest text-[var(--soouls-text-faint)]">
                          {theme.label.toUpperCase()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl p-8 flex flex-col justify-between min-h-[220px]" style={{ backgroundColor: 'var(--soouls-bg-panel)' }}>
                <h3 className="text-[15px] mb-1 font-medium text-[var(--soouls-text-strong)]">
                  Your thinking is shifting
                </h3>
                <p className="text-[10px] tracking-wider mb-6 text-[var(--soouls-text-faint)]">EVOLUTION CYCLE</p>

                <div className="space-y-4">
                  {shiftMetrics.map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="text-[11px] tracking-wide font-medium text-[var(--soouls-text-muted)]">
                        {item.label.toUpperCase()}
                      </span>
                      {item.icon}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl p-10 text-center" style={{ backgroundColor: 'var(--soouls-bg-panel)' }}>
              <div className="flex justify-center mb-6">
                <LeafIcon className="w-6 h-6 text-[#86A861]" />
              </div>
              <p className="text-[11px] tracking-widest mb-4" style={{ color: 'var(--soouls-accent)' }}>
                FINAL SYNTHESIS
              </p>
              <p className="text-2xl md:text-3xl font-playfair italic mb-4 text-[var(--soouls-text-strong)]">
                “{insights?.finalSynthesis ?? 'Your writing suggests a meaningful transition is underway.'}”
              </p>
              <p className="text-sm max-w-2xl mx-auto leading-relaxed font-light text-[var(--soouls-text-muted)]">
                This summary updates from your actual entries, settings, and reflective cadence.
              </p>
            </div>
          </motion.div>
        </section>

        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-[1600px] px-6 md:px-12 z-50 pointer-events-none flex justify-between items-center">
          <button
            onClick={() => router.push('/home/canvas')}
            className="pointer-events-auto flex items-center gap-3 text-[15px] transition-colors px-6 py-3.5 rounded-full shadow-2xl"
            style={{ color: 'var(--soouls-text-muted)', backgroundColor: 'rgba(17,17,17,0.9)' }}
          >
            <Search className="w-[18px] h-[18px]" />
            <span className="font-light tracking-wide">Search Entries</span>
          </button>

          <Link href="/home" className="pointer-events-auto flex items-center justify-center group absolute left-1/2 -translate-x-1/2">
            <div className="flex items-center justify-center text-[#BDBBAF] group-hover:text-white transition-colors drop-shadow-2xl">
              <SymbolLogo className="w-14 h-14" variant="solid" />
            </div>
          </Link>

          <button
            onClick={() => setIsCalendarOpen(true)}
            className="pointer-events-auto flex items-center gap-3 text-[15px] text-white transition-colors px-6 py-3.5 rounded-full shadow-[0_0_25px_rgba(212,107,78,0.15)] border"
            style={{
              backgroundColor: 'rgba(17,17,17,0.9)',
              borderColor: 'rgba(var(--soouls-accent-rgb), 0.4)',
            }}
          >
            <Calendar className="w-5 h-5" />
            <span className="font-medium tracking-wide">Calendar</span>
          </button>
        </div>
      </main>


      <AnimatePresence>
        {showSidebar && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowSidebar(false)}
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 z-50 w-80 h-full shadow-2xl p-8 flex flex-col rounded-l-2xl overflow-hidden"
              style={{ backgroundColor: 'var(--soouls-bg-elevated)' }}
            >
              <button onClick={() => setShowSidebar(false)} className="absolute top-6 right-6 transition-colors z-10 text-[var(--soouls-text-muted)] hover:text-[var(--soouls-text-strong)]">
                <X className="w-6 h-6 stroke-[1]" />
              </button>

              <div className="mb-10 pt-2 flex flex-col items-start relative z-10">
                <div className="flex gap-4 items-center mb-2">
                  <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 border-2 border-white/10" style={{ backgroundColor: 'var(--soouls-bg-surface)' }}>
                    {user?.imageUrl ? (
                      <img src={user.imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/50">U</div>
                    )}
                  </div>
                  <div>
                    <p className="text-[22px] font-playfair italic leading-tight text-[var(--soouls-text-strong)]">
                      Hello there,
                    </p>
                  </div>
                </div>
                <h2 className="text-[32px] font-bold tracking-tight leading-none mb-4" style={{ color: 'var(--soouls-accent)' }}>
                  {userName}
                </h2>
                <p className="text-xl font-playfair italic leading-snug text-[var(--soouls-text-strong)]">
                  “You&apos;ve shown up <span style={{ color: 'var(--soouls-accent)' }}>{account?.stats.streak ?? 0} days</span>
                  <br />
                  in a row.”
                </p>
              </div>

              <nav className="flex-1 space-y-2 relative z-10">
                {[
                  { label: 'Dashboard', href: '/home', icon: <DiamondIcon className="w-5 h-5" /> },
                  { label: 'Insights', href: '/home/insights', icon: <Sparkles className="w-5 h-5 stroke-[1.5]" /> },
                  { label: 'Clusters', href: '/home/clusters', icon: <CanvasLoopIcon className="w-5 h-5" /> },
                  { label: 'Canvas', href: '/home/canvas', icon: <CanvasLoopIcon className="w-5 h-5" /> },
                  { label: 'Account', href: '/home/account', icon: <UserCircle className="w-5 h-5 stroke-[1.5]" /> },
                  { label: 'Settings', href: '/home/settings', icon: <Settings className="w-5 h-5 stroke-[1.5]" /> },
                ].map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-4 px-2 py-3 transition-all text-[var(--soouls-text-strong)] hover:text-[var(--soouls-accent)]"
                    onClick={() => setShowSidebar(false)}
                  >
                    {item.icon}
                    <span className="text-lg font-light tracking-wide">{item.label}</span>
                  </Link>
                ))}

                <button
                  onClick={() => {
                    setShowSidebar(false);
                    setShowLogoutModal(true);
                  }}
                  className="flex items-center gap-4 px-2 py-3 text-red-500 hover:text-red-400 transition-all mt-4 w-full"
                >
                  <LogOut className="w-5 h-5 stroke-[1.5]" />
                  <span className="text-lg font-light tracking-wide">Logout</span>
                </button>
              </nav>

              <SymbolLogo className="absolute -bottom-16 -right-16 w-64 h-64 text-[#E6E1D8]/30 pointer-events-none" variant="solid" />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLogoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg rounded-[2rem] p-10 text-center shadow-2xl relative overflow-hidden"
              style={{ backgroundColor: '#838182' }}
            >
              <SymbolLogo className="absolute -top-4 -right-4 w-32 h-32 rotate-12 opacity-90" variant="solid" />

              <div className="relative z-10 text-left">
                <h2 className="text-[40px] font-urbanist font-light text-white mb-2">Leaving for now?</h2>
                <p className="text-2xl text-white/90 font-playfair italic mb-16">
                  Your thoughts are safely stored. You can
                  <br />
                  return anytime.
                </p>

                <div className="flex gap-6 justify-center mb-8">
                  <button
                    onClick={() => setShowLogoutModal(false)}
                    className="w-36 py-3.5 rounded-2xl bg-[#4A4A4A] border text-white transition-all text-lg font-medium shadow-lg"
                    style={{ borderColor: 'var(--soouls-accent)' }}
                  >
                    Stay
                  </button>
                  <button
                    onClick={() => signOut({ redirectUrl: '/' })}
                    className="w-36 py-3.5 rounded-2xl bg-[#D33F3F] border border-[#B33535] text-white transition-all text-lg font-medium shadow-lg"
                  >
                    Logout
                  </button>
                </div>

                <p className="text-center text-lg text-white/60 font-playfair italic">See you soon.</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>{isCalendarOpen && <CalendarModal onClose={() => setIsCalendarOpen(false)} />}</AnimatePresence>
    </div>
  );
}
