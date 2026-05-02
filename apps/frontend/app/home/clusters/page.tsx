'use client';

import { useUser } from '@clerk/nextjs';
import { GraduationCap, Lightbulb, Search, Settings, Sparkles, Sun } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';
import { useSidebar } from '../../../src/providers/sidebar-provider';
import { trpc } from '../../../src/utils/trpc';

const FILTERS = [
  { key: 'active', label: 'Most Active' },
  { key: 'updated', label: 'Recently Updated' },
  { key: 'intensity', label: 'Emotion Intensity' },
] as const;

function ClusterIcon({ index }: { index: number }) {
  const className = 'w-4 h-4';
  const style = { color: 'var(--soouls-accent)' };
  if (index % 3 === 0) return <Sun className={className} style={style} />;
  if (index % 3 === 1) return <GraduationCap className={className} style={style} />;
  return <Lightbulb className={className} style={style} />;
}

export default function ClustersPage() {
  const router = useRouter();
  const { user } = useUser();
  const { setIsOpen } = useSidebar();
  const { data } = trpc.private.home.getClusters.useQuery(undefined);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['key']>('active');

  const clusters = useMemo(() => {
    const items = [...(data?.items ?? [])].filter((cluster) => {
      const corpus = `${cluster.name} ${cluster.description}`.toLowerCase();
      return corpus.includes(query.toLowerCase());
    });

    if (filter === 'active') {
      items.sort((left, right) => right.entryCount - left.entryCount);
    } else if (filter === 'intensity') {
      items.sort((left, right) => {
        if (left.strength === right.strength) return right.entryCount - left.entryCount;
        return left.strength === 'Dominant' ? -1 : 1;
      });
    }

    return items;
  }, [data?.items, filter, query]);

  const featured = clusters[0];

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden select-none"
      style={{ backgroundColor: 'var(--soouls-bg)', color: 'var(--soouls-text)', fontFamily: "'Urbanist', sans-serif" }}
    >
      <div className="absolute top-12 left-0 right-0 flex justify-center pointer-events-none opacity-[0.7] select-none z-0 overflow-hidden whitespace-nowrap">
        <span
          className="text-[18vw] font-urbanist font-light leading-none text-transparent tracking-widest"
          style={{
            WebkitTextStroke: '1px var(--soouls-text-faint)',
          }}
        >
          Soouls
        </span>
      </div>

      <header className="w-full max-w-[1600px] mx-auto px-6 md:px-12 py-8 flex justify-between items-center relative z-20">
        <div className="flex items-center gap-2 text-[22px] font-light tracking-wide">
          <button
            onClick={() => typeof window !== 'undefined' && window.history.back()}
            className="text-[var(--soouls-text-faint)] hover:text-[var(--soouls-text)] transition-colors"
          >
            Home
          </button>
          <span className="text-[var(--soouls-accent)] ml-2">/ Clusters</span>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="w-10 h-10 rounded-full border-2 border-[var(--soouls-border)] hover:border-[var(--soouls-text-faint)] transition-all cursor-pointer overflow-hidden shadow-[0_4px_4px_rgba(0,0,0,0.25)]"
        >
          {user?.imageUrl && (
            <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
          )}
        </button>
      </header>

      <main className="flex-1 w-full max-w-[1600px] mx-auto px-6 md:px-12 relative z-10 flex flex-col mt-12 pb-0 items-stretch">
        <section
          className="flex-1 backdrop-blur-[48px] border-t border-[var(--soouls-border)] rounded-t-[32px] overflow-hidden flex flex-col"
          style={{ backgroundColor: 'var(--soouls-bg-panel)' }}
        >
          {/* Main Card Header */}
          <div className="p-12 space-y-10">
            <div className="flex justify-between items-start">
              <div className="space-y-4">
                <h1 
                  className="text-[60px] leading-none italic tracking-[-0.035em]"
                  style={{ fontFamily: "'Playfair Display', serif", color: 'var(--soouls-accent)' }}
                >
                  Your thought clusters
                </h1>
                <p className="text-[28px] text-[var(--soouls-text-muted)] tracking-[-0.035em]">
                  these are the spaces your thoughts naturally gather
                </p>
              </div>

              <div className="flex flex-col gap-8 items-end">
                {/* Search Bar */}
                <div 
                  className="w-[509px] h-[57px] flex items-center px-7 gap-3 rounded-[48px]"
                  style={{ backgroundColor: 'var(--soouls-overlay-muted)' }}
                >
                  <Search className="w-6 h-6 text-[var(--soouls-text-faint)]" />
                  <input
                    type="text"
                    placeholder="search clusters"
                    className="bg-transparent border-none outline-none text-[26px] text-[var(--soouls-text)] placeholder:text-[var(--soouls-text-faint)] w-full"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>

                {/* Filter Pills */}
                <div className="flex gap-2.5">
                  {FILTERS.map((option) => (
                    <button
                      key={option.key}
                      onClick={() => setFilter(option.key)}
                      className={`px-8 py-2 rounded-[60px] text-[15px] font-bold transition-all border ${
                        filter === option.key
                          ? 'bg-[var(--soouls-accent)]/20 border-[var(--soouls-accent)] text-[var(--soouls-accent)]' 
                          : 'bg-[var(--soouls-bg)]/20 border-[var(--soouls-text-faint)] text-[var(--soouls-text-faint)]'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Insight Sparkle Bar */}
            <div 
              className="flex items-center gap-4 py-4 px-10 -mx-12 border-y border-[var(--soouls-border)]"
              style={{ backgroundColor: 'var(--soouls-bg-panel)' }}
            >
              <p className="text-[28px] text-[var(--soouls-text-muted)]">
                {data?.headline ?? 'Your recent thoughts are beginning to cluster.'}
              </p>
            </div>
          </div>

          <div className="flex-1 p-12 overflow-y-auto space-y-16 custom-scrollbar pb-32">
            {featured ? (
              <button
                type="button"
                onClick={() => router.push(`/home/clusters/${featured.id}`)}
                className="w-full text-left backdrop-blur-[75px] border border-[var(--soouls-accent)]/25 rounded-[32px] p-16 flex justify-between items-center relative group transition-all hover:bg-[var(--soouls-overlay-subtle)]"
                style={{ backgroundColor: 'var(--soouls-bg-elevated)', boxShadow: '0px 4.98px 4.98px rgba(0, 0, 0, 0.25)' }}
              >
                <div className="flex-1 space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="px-8 py-4 rounded-[60px] border border-[var(--soouls-accent)] bg-[var(--soouls-accent)]/20 text-[var(--soouls-accent)] text-[15px] font-bold">
                      {featured.strength === 'Dominant' ? 'ACTIVE HUB' : 'EMERGING'}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <GraduationCap className="w-8 h-8 text-[var(--soouls-accent)]" />
                      <h2 
                        className="text-[28px] italic tracking-[-0.035em] text-[var(--soouls-text)]"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                      >
                        {featured.name}
                      </h2>
                    </div>
                    <p className="text-[20px] font-light leading-tight text-[var(--soouls-text-muted)] max-w-2xl tracking-[-0.035em]">
                      {featured.description}
                    </p>
                  </div>

                  <div className="flex gap-32">
                    <div className="space-y-4">
                      <span className="text-[16px] font-light text-[var(--soouls-text-faint)] tracking-[-0.035em] block uppercase">EMOTION TONE</span>
                      <div className="text-[16px] font-light text-[var(--soouls-text)]">
                        {featured.tones.join('  •     ')}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <span className="text-[16px] font-light text-[var(--soouls-text-faint)] tracking-[-0.035em] block uppercase">STRENGTH</span>
                      <div className="text-[16px] font-light text-[var(--soouls-accent)]">
                        {featured.strength}
                      </div>
                    </div>
                  </div>
                </div>

                <div 
                  className="w-[300px] h-[300px] rounded-full border border-[var(--soouls-accent)] bg-[var(--soouls-accent)]/5 flex flex-col items-center justify-center space-y-5"
                >
                  <div className="text-[60px] italic leading-none text-[var(--soouls-text)]" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {featured.entryCount}
                  </div>
                  <div className="text-[15px] font-bold text-[var(--soouls-accent)] tracking-[-0.035em]">
                    ENTRIES
                  </div>
                </div>
              </button>
            ) : (
              <div
                className="rounded-[32px] border border-[var(--soouls-border)] p-16 text-center text-[20px] text-[var(--soouls-text-muted)]"
                style={{ backgroundColor: 'var(--soouls-overlay-subtle)' }}
              >
                Your first few entries will begin forming visible clusters here.
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {clusters.map((cluster, index) => (
                <button
                  key={cluster.id}
                  onClick={() => router.push(`/home/clusters/${cluster.id}`)}
                  className="backdrop-blur-sm border border-[var(--soouls-border)] rounded-[20px] p-8 space-y-12 text-left hover:bg-[var(--soouls-overlay-subtle)] transition-all flex flex-col"
                  style={{ backgroundColor: 'var(--soouls-bg-elevated)' }}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-6">
                      <h3 
                        className="text-[36px] italic leading-none text-[var(--soouls-text)]"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                      >
                        {cluster.name}
                      </h3>
                      <div className="text-[16px] font-light text-[var(--soouls-text-muted)]">
                        {cluster.entryCount} entries    •    {cluster.updatedAtLabel}
                      </div>
                    </div>
                    <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                      <ClusterIcon index={index} />
                    </div>
                  </div>

                  <p className="text-[20px] font-medium italic leading-tight text-[var(--soouls-accent)]/75 tracking-[-0.035em]">
                    {cluster.description}
                  </p>

                  <div className="pt-4 flex justify-between items-center border-t border-white/5">
                    <div className="px-8 py-2 rounded-[60px] border border-[var(--soouls-accent)] bg-[var(--soouls-accent)]/20 text-[var(--soouls-accent)] text-[15px] font-bold">
                      {cluster.strength === 'Dominant' ? 'ACTIVE HUB' : 'EMERGING'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      </main>

      <div
        className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full blur-[120px] pointer-events-none"
        style={{ backgroundColor: 'rgba(var(--soouls-accent-rgb), 0.05)' }}
      />
      <div
        className="absolute top-1/2 -right-20 w-80 h-80 rounded-full blur-[100px] pointer-events-none"
        style={{ backgroundColor: 'rgba(var(--soouls-accent-rgb), 0.06)' }}
      />
    </div>
  );
}
