'use client';

import { useUser } from '@clerk/nextjs';
import { Calendar, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';
import { useSidebar } from '../../../src/providers/sidebar-provider';
import { formatCurrentMonthRange } from '../../../src/utils/home';
import { trpc } from '../../../src/utils/trpc';
import { BackgroundText } from '../../components/BackgroundText';
import { PremiumWrapper } from '../../components/PremiumWrapper';

const FONT_URBANIST = 'var(--font-urbanist), system-ui, sans-serif';

function avatarFor(seed?: string | null) {
  return `https://api.dicebear.com/9.x/glass/svg?seed=${encodeURIComponent(seed || 'Soouls')}&backgroundColor=1c1c1c,e07a5f&radius=50`;
}

/* ─────────── tiny SVG icons ─────────── */
const LeafIcon = () => (
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

/* All data comes from API — no fallback constants */

function SectionCard({
  children,
  className = '',
}: { children: React.ReactNode; className?: string }) {
  return (
    <section
      className={`rounded-[20px] border border-[rgba(255,255,255,0.04)] p-[32px] flex flex-col ${className}`}
      style={{ backgroundColor: 'var(--soouls-bg-panel)' }}
    >
      {children}
    </section>
  );
}

export default function InsightsPage() {
  const { user } = useUser();
  const { setIsOpen } = useSidebar();

  const utils = trpc.useUtils();
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);

  const { data: insights, isLoading: insightsLoading } =
    trpc.private.home.getInsights.useQuery(undefined);
  const { data: entries, isLoading: entriesLoading } = trpc.private.entries.getAll.useQuery({
    limit: 120,
    cursor: 0,
  });

  const refreshInsights = trpc.private.home.refreshInsights.useMutation();
  const isLoading = insightsLoading || entriesLoading;

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setRefreshError(null);
    try {
      // 1. Trigger explicit insight refresh (invalidates Redis and triggers background job)
      await refreshInsights.mutateAsync({});

      // 2. Invalidate TRPC queries to re-fetch from the backend
      await utils.private.home.getInsights.invalidate();
      await utils.private.entries.getAll.invalidate();
    } catch (err) {
      console.error('[InsightsPage] Refresh failed:', err);
      setRefreshError('Refresh failed. Check your connection and try again.');
    } finally {
      setRefreshing(false);
    }
  }, [refreshInsights, utils]);

  const peakTimeData = useMemo(() => {
    const timeSlots = [
      { label: 'Morning', note: '6 AM – 10 AM', hours: [6, 7, 8, 9] },
      { label: 'Midday', note: '10 AM – 2 PM', hours: [10, 11, 12, 13] },
      { label: 'Afternoon', note: '2 PM – 6 PM', hours: [14, 15, 16, 17] },
      { label: 'Evening', note: '6 PM – 10 PM', hours: [18, 19, 20, 21] },
      { label: 'Late Night', note: '10 PM – 2 AM', hours: [22, 23, 0, 1] },
    ];

    if (!entries?.items?.length) return { slot: 'Late Night', note: '10 PM – 2 AM' };

    const counts = timeSlots.map((slot) => ({
      ...slot,
      count: entries.items.filter((e) => slot.hours.includes(new Date(e.createdAt).getHours()))
        .length,
    }));

    const peak = counts.sort((a, b) => b.count - a.count)[0];
    if (!peak) return { slot: 'Late Night', note: '10 PM – 2 AM' };
    return { slot: peak.label, note: peak.note };
  }, [entries]);

  const entryCount = insights?.overview?.entryCount ?? 0;

  const thoughtThemes = useMemo(() => {
    if (!insights?.thoughtThemes?.length) return [];
    return insights.thoughtThemes
      .map((t) => ({
        label: t.label,
        entries: t.count,
        pct: Math.max(1, Math.min(100, Math.round(t.progress))),
      }))
      .slice(0, 5);
  }, [insights]);

  const thinkingShifts = insights?.thinkingShifts ?? [];

  const reflectionBars = useMemo(() => {
    if (insights?.reflectionHistogram?.length) {
      return insights.reflectionHistogram.map((slot) =>
        slot.count > 0 ? Math.max(8, slot.percentage) : 4,
      );
    }
    return [];
  }, [insights?.reflectionHistogram]);

  const avatarUrl =
    user?.imageUrl || avatarFor(user?.primaryEmailAddress?.emailAddress || user?.id);

  function parseHighlightedText(text: string | undefined | null, fallback: string) {
    if (!text) return fallback;
    const parts = text.split(/(\{ts[12]\}.*?\{\/ts[12]\})/g);

    return parts.map((part, i) => {
      if (part.startsWith('{ts1}')) {
        const innerText = part.replace(/\{ts1\}/g, '').replace(/\{\/ts1\}/g, '');
        return (
          <span key={i} className="font-playfair italic" style={{ color: 'var(--soouls-accent)' }}>
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

  return (
    <div
      className="soouls-page flex flex-col relative overflow-hidden select-none transition-colors duration-300"
      style={{
        backgroundColor: 'var(--soouls-bg)',
        color: 'var(--soouls-text)',
        fontFamily: FONT_URBANIST,
      }}
    >
      <BackgroundText />

      {/* fixed responsive header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#202020]/40 backdrop-blur-md border-b border-white/[0.04]">
        <div className="w-full max-w-[1600px] mx-auto px-6 md:px-12 h-20 flex justify-between items-center">
          <div className="flex items-center gap-2 text-[20px] sm:text-[22px] font-light tracking-wide min-w-0 pr-4">
            <Link
              href="/home"
              className="transition-colors hover:opacity-80 shrink-0"
              style={{ color: 'var(--soouls-text-faint)' }}
            >
              Home
            </Link>
            <span style={{ color: 'var(--soouls-accent)' }} className="ml-2 truncate font-sans">
              / Insights
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 transition-colors transition-transform transition-shadow cursor-pointer overflow-hidden border-white/[0.08]"
              style={{
                boxShadow: '0 4px 4px rgba(0,0,0,0.25)',
              }}
            >
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
            </button>
          </div>
        </div>
      </header>

      <PremiumWrapper>
        <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 md:px-8 relative z-10 flex flex-col pt-[120px] md:pt-48 lg:pt-[12vw] pb-28 items-stretch">
          <section className="soouls-panel w-full rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-12 flex flex-col gap-6">
            <div className="flex justify-between items-center mb-6 px-2">
              <h1 className="text-[26px] font-light tracking-[-0.01em] text-[#f0ece6] font-sans">
                Soouls Insights
              </h1>
              <div className="flex items-center gap-[12px]">
                <span className="flex items-center gap-[8px] text-[13px] font-light tracking-[0.02em] text-[rgba(240,236,230,0.6)]">
                  <Calendar className="w-4 h-4 text-[var(--soouls-accent)]" strokeWidth={1.5} />
                  {formatCurrentMonthRange()}
                </span>
                {insights?.lastUpdated ? (
                  <span className="hidden text-[11px] font-light tracking-[0.02em] text-[rgba(240,236,230,0.34)] md:inline">
                    Last updated:{' '}
                    {new Date(insights.lastUpdated).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                ) : null}
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={refreshing || isLoading}
                  className="flex items-center gap-[6px] px-[14px] py-[6px] rounded-full border text-[11px] font-medium tracking-[0.04em] uppercase transition-colors transition-transform transition-shadow duration-300 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-[0_0_16px_rgba(var(--soouls-accent-rgb),0.3)]"
                  style={{
                    borderColor: 'var(--soouls-accent)',
                    color: 'var(--soouls-accent)',
                    backgroundColor: 'rgba(var(--soouls-accent-rgb),0.06)',
                  }}
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`}
                    strokeWidth={2}
                  />
                  {refreshing ? 'Refreshing…' : 'Refresh'}
                </button>
              </div>
            </div>

            {refreshError ? (
              <p className="px-2 text-[12px] font-light text-[var(--soouls-accent)]">
                {refreshError}
              </p>
            ) : null}

            {entryCount === 0 ? (
              <SectionCard>
                <div className="flex flex-col items-center justify-center text-center py-[48px] gap-4">
                  <LeafIcon />
                  <p className="text-[18px] font-light text-[rgba(240,236,230,0.5)] max-w-[400px]">
                    No entries yet this month. Start journaling to see your insights.
                  </p>
                </div>
              </SectionCard>
            ) : (
              <SectionCard>
                <div className="flex justify-between items-start mb-[24px]">
                  <LeafIcon />
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

                {entryCount > 0 && entryCount < 5 && (
                  <div className="mt-8 pt-6 border-t border-[rgba(240,236,230,0.05)]">
                    <p className="text-[10px] tracking-[0.05em] text-[rgba(240,236,230,0.3)] uppercase">
                      Based on {entryCount} {entryCount === 1 ? 'entry' : 'entries'} — insights will
                      deepen as you write more.
                    </p>
                  </div>
                )}
              </SectionCard>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
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
                    {thoughtThemes.map((t, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between text-[11px] font-medium tracking-wider text-[rgba(240,236,230,0.45)]">
                          <span>{t.label.toUpperCase()}</span>
                          <span>{t.pct}%</span>
                        </div>
                        <div className="h-[10px] rounded-full overflow-hidden bg-[#3c241a]">
                          <div
                            className="h-full rounded-full transition-colors transition-transform transition-shadow duration-500"
                            style={{
                              width: `${t.pct}%`,
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
                      You tend to reflect most during {peakTimeData.slot.toLowerCase()}s<br />
                      <span className="font-normal text-[#f0ece6]">({peakTimeData.note})</span>
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

                {/* Histogram */}
                <div className="flex items-end justify-center h-[80px] w-full mt-[36px] gap-1">
                  {reflectionBars.map((height, i) => {
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
                        className="flex-1 max-w-[32px] transition-colors transition-transform transition-shadow duration-300 cursor-pointer"
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
              {/* Relationship Map */}
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

                    {/* Dynamic Links */}
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

                    {/* Dynamic Nodes */}
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

              {/* Evolution Cycle */}
              <SectionCard>
                <h2 className="text-[24px] font-light tracking-[-0.01em] text-[#f0ece6] mb-[6px] font-sans">
                  Your thinking is shifting
                </h2>
                <p className="text-[11px] font-light tracking-[0.06em] text-[rgba(240,236,230,0.6)] uppercase mb-[36px]">
                  Evolution Cycle
                </p>

                <div className="space-y-[24px] flex-1 flex flex-col justify-center px-2 pb-2">
                  {thinkingShifts.length === 0 ? (
                    <p className="text-[13px] font-light text-[rgba(240,236,230,0.35)] italic">
                      More entries needed for trend analysis.
                    </p>
                  ) : (
                    thinkingShifts.map((item, i) => (
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

            {/* Final Synthesis */}
            <SectionCard className="relative flex flex-col items-center text-center py-[80px] px-[64px] mt-4 mb-12">
              <div className="absolute top-[32px] left-[32px]">
                <LeafIcon />
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
          </section>
        </main>
      </PremiumWrapper>
    </div>
  );
}
