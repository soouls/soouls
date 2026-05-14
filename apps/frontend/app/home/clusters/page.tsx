'use client';

import { useUser } from '@clerk/nextjs';
import { GraduationCap, Lightbulb, Search, Sparkles, Sun } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';
import { useSidebar } from '../../../src/providers/sidebar-provider';
import { trpc } from '../../../src/utils/trpc';

function avatarFor(seed?: string | null) {
  return `https://api.dicebear.com/9.x/glass/svg?seed=${encodeURIComponent(seed || 'Soouls')}&backgroundColor=1c1c1c,e07a5f&radius=50`;
}

const FILTERS = [
  { key: 'active', label: 'Most Active' },
  { key: 'updated', label: 'Recently Updated' },
  { key: 'intensity', label: 'Emotion Intensity' },
] as const;

function ClusterIcon({ index }: { index: number }) {
  const cls = 'w-5 h-5';
  const style = { color: 'var(--soouls-accent)' };
  if (index % 3 === 0) return <Sun className={cls} style={style} />;
  if (index % 3 === 1) return <GraduationCap className={cls} style={style} />;
  return <Lightbulb className={cls} style={style} />;
}

export default function ClustersPage() {
  const router = useRouter();
  const { user } = useUser();
  const { setIsOpen } = useSidebar();
  const { data } = trpc.private.home.getClusters.useQuery(undefined);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['key']>('active');

  const clusters = useMemo(() => {
    const items = [...(data?.items ?? [])].filter((c) => {
      const corpus = `${c.name} ${c.description}`.toLowerCase();
      return corpus.includes(query.toLowerCase());
    });
    if (filter === 'active') items.sort((a, b) => b.entryCount - a.entryCount);
    else if (filter === 'intensity') {
      items.sort((a, b) => {
        if (a.strength === b.strength) return b.entryCount - a.entryCount;
        return a.strength === 'Dominant' ? -1 : 1;
      });
    }
    return items;
  }, [data?.items, filter, query]);

  const featured = clusters[0];
  const rest = clusters.slice(1);

  const avatarUrl =
    user?.imageUrl || avatarFor(user?.primaryEmailAddress?.emailAddress || user?.id);

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden select-none"
      style={{
        backgroundColor: 'var(--soouls-bg)',
        color: 'var(--soouls-text)',
        fontFamily: "'Urbanist', sans-serif",
      }}
    >
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap');
        .font-playfair { font-family: 'Playfair Display', serif; }
      `}</style>

      {/* Hero watermark */}
      <div className="absolute top-12 left-0 right-0 flex justify-center pointer-events-none opacity-[0.85] select-none z-0 overflow-hidden whitespace-nowrap">
        <span
          className="text-[18vw] font-urbanist font-bold leading-none text-transparent tracking-widest"
          style={{ WebkitTextStroke: '2px var(--soouls-overlay-strong)' }}
        >
          Soouls
        </span>
      </div>

      {/* Header */}
      <header className="w-full max-w-[1600px] mx-auto px-6 md:px-12 py-8 flex justify-between items-center relative z-20">
        <div className="flex items-center gap-2 text-[22px] font-light tracking-wide">
          <Link
            href="/home"
            className="transition-colors hover:opacity-80"
            style={{ color: 'var(--soouls-text-faint)' }}
          >
            Home
          </Link>
          <span style={{ color: 'var(--soouls-accent)' }} className="ml-1">
            / Clusters
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-10 h-10 rounded-full border-2 transition-all cursor-pointer overflow-hidden"
          style={{
            borderColor: 'var(--soouls-overlay-muted)',
            boxShadow: '0 4px 4px rgba(0,0,0,0.25)',
          }}
        >
          <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
        </button>
      </header>

      {/* Main card panel — overlaps the watermark text */}
      <main
        className="flex-1 w-full max-w-[1600px] mx-auto px-4 md:px-8 relative z-10 flex flex-col pb-28"
        style={{ marginTop: 'calc(9vw - 4rem)' }}
      >
        <section
          className="w-full rounded-[2rem] flex flex-col overflow-hidden"
          style={{
            backgroundColor: 'var(--soouls-bg-surface)',
            border: '1px solid var(--soouls-border)',
          }}
        >
          {/* Card header row */}
          <div className="p-8 md:p-12 flex flex-col xl:flex-row justify-between items-start gap-8">
            {/* Left: title + subtitle */}
            <div className="space-y-3">
              <h1
                className="font-playfair text-[52px] md:text-[64px] leading-none italic tracking-[-0.02em]"
                style={{ color: 'var(--soouls-accent)' }}
              >
                Your thought clusters
              </h1>
              <p className="text-[18px] font-light" style={{ color: 'var(--soouls-text-faint)' }}>
                these are the spaces your thoughts naturally gather
              </p>
            </div>

            {/* Right: search + filters */}
            <div className="flex flex-col gap-4 items-start xl:items-end w-full xl:w-auto shrink-0">
              {/* Search */}
              <div
                className="flex items-center gap-3 px-5 py-3 rounded-full w-full xl:w-[380px]"
                style={{
                  backgroundColor: 'rgba(230,226,214,0.12)',
                  border: '1px solid rgba(230,226,214,0.1)',
                }}
              >
                <Search className="w-5 h-5 shrink-0" style={{ color: 'rgba(230,226,214,0.4)' }} />
                <input
                  type="text"
                  placeholder="search clusters"
                  className="bg-transparent border-none outline-none text-[16px] w-full placeholder:text-[rgba(230,226,214,0.35)]"
                  style={{ color: 'var(--soouls-text)' }}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>

              {/* Filter pills */}
              <div className="flex flex-wrap gap-2">
                {FILTERS.map((opt) => (
                  <button
                    type="button"
                    key={opt.key}
                    onClick={() => setFilter(opt.key)}
                    className="px-5 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.12em] transition-all border"
                    style={
                      filter === opt.key
                        ? {
                            backgroundColor: 'rgba(var(--soouls-accent-rgb),0.15)',
                            borderColor: 'var(--soouls-accent)',
                            color: 'var(--soouls-accent)',
                          }
                        : {
                            backgroundColor: 'transparent',
                            borderColor: 'rgba(230,226,214,0.25)',
                            color: 'rgba(230,226,214,0.55)',
                          }
                    }
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Insight sparkle bar */}
          <div
            className="flex items-center gap-4 px-8 md:px-12 py-4 border-y"
            style={{ backgroundColor: 'rgba(18,18,18,0.6)', borderColor: 'var(--soouls-border)' }}
          >
            <Sparkles className="w-5 h-5 shrink-0" style={{ color: 'rgba(230,226,214,0.35)' }} />
            <p className="text-[16px] font-light" style={{ color: 'rgba(230,226,214,0.5)' }}>
              {data?.headline ?? 'Your recent thoughts are beginning to cluster.'}
            </p>
          </div>

          {/* Content area */}
          <div className="p-8 md:p-12 space-y-10">
            {/* Featured cluster */}
            {featured ? (
              <button
                type="button"
                onClick={() => router.push(`/home/clusters/${featured.id}`)}
                className="w-full text-left rounded-[24px] p-8 md:p-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 transition-all hover:brightness-110 group"
                style={{
                  backgroundColor: 'var(--soouls-bg-panel)',
                  border: '1px solid rgba(var(--soouls-accent-rgb),0.3)',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
                }}
              >
                {/* Left content */}
                <div className="flex-1 space-y-6">
                  {/* Badge */}
                  <div className="inline-flex">
                    <span
                      className="px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.15em]"
                      style={{
                        border: '1px solid var(--soouls-accent)',
                        color: 'var(--soouls-accent)',
                        backgroundColor: 'rgba(var(--soouls-accent-rgb),0.12)',
                      }}
                    >
                      {featured.strength === 'Dominant' ? 'Active Hub' : 'Emerging'}
                    </span>
                  </div>

                  {/* Name row */}
                  <div className="flex items-center gap-3">
                    <GraduationCap className="w-6 h-6" style={{ color: 'var(--soouls-accent)' }} />
                    <h2
                      className="font-playfair text-[28px] md:text-[34px] italic leading-none"
                      style={{ color: '#f0ece6' }}
                    >
                      {featured.name}
                    </h2>
                  </div>

                  {/* Description */}
                  <p
                    className="text-[15px] font-light leading-relaxed max-w-xl"
                    style={{ color: 'rgba(240,236,230,0.7)' }}
                  >
                    {featured.description}
                  </p>

                  {/* Meta row */}
                  <div className="flex gap-16 pt-2">
                    <div className="space-y-1">
                      <p
                        className="text-[11px] uppercase tracking-[0.12em] font-medium"
                        style={{ color: 'rgba(240,236,230,0.35)' }}
                      >
                        Emotion Tone
                      </p>
                      <p
                        className="text-[14px] font-light"
                        style={{ color: 'rgba(240,236,230,0.75)' }}
                      >
                        {featured.tones?.join('  •  ') || '—'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p
                        className="text-[11px] uppercase tracking-[0.12em] font-medium"
                        style={{ color: 'rgba(240,236,230,0.35)' }}
                      >
                        Strength
                      </p>
                      <p
                        className="text-[14px] font-light"
                        style={{ color: 'var(--soouls-accent)' }}
                      >
                        {featured.strength}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Entry count circle */}
                <div
                  className="w-[180px] h-[180px] md:w-[220px] md:h-[220px] rounded-full flex flex-col items-center justify-center shrink-0"
                  style={{
                    backgroundColor: 'rgba(var(--soouls-accent-rgb),0.12)',
                    border: '1px solid rgba(var(--soouls-accent-rgb),0.2)',
                  }}
                >
                  <span
                    className="font-playfair text-[56px] md:text-[72px] italic leading-none"
                    style={{ color: '#f0ece6' }}
                  >
                    {featured.entryCount}
                  </span>
                  <span
                    className="text-[11px] font-bold uppercase tracking-[0.15em] mt-1"
                    style={{ color: 'var(--soouls-accent)' }}
                  >
                    Entries
                  </span>
                </div>
              </button>
            ) : (
              <div
                className="rounded-[24px] p-16 text-center text-[16px] font-light"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  color: 'rgba(240,236,230,0.4)',
                }}
              >
                Your first few entries will begin forming visible clusters here.
              </div>
            )}

            {/* Cluster grid */}
            {rest.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rest.map((cluster, index) => (
                  <button
                    type="button"
                    key={cluster.id}
                    onClick={() => router.push(`/home/clusters/${cluster.id}`)}
                    className="rounded-[20px] p-7 flex flex-col gap-5 text-left transition-all hover:brightness-110"
                    style={{
                      backgroundColor: 'var(--soouls-bg-panel)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    {/* Top row: name + icon */}
                    <div className="flex justify-between items-start gap-3">
                      <div className="space-y-1.5">
                        <h3
                          className="font-playfair text-[26px] italic leading-tight"
                          style={{ color: '#f0ece6' }}
                        >
                          {cluster.name}
                        </h3>
                        <p
                          className="text-[12px] font-light"
                          style={{ color: 'rgba(240,236,230,0.4)' }}
                        >
                          {cluster.entryCount} entries · {cluster.updatedAtLabel}
                        </p>
                      </div>
                      <div
                        className="p-2.5 rounded-xl shrink-0"
                        style={{ backgroundColor: 'rgba(var(--soouls-accent-rgb),0.1)' }}
                      >
                        <ClusterIcon index={index} />
                      </div>
                    </div>

                    {/* Description */}
                    <p
                      className="text-[13px] font-light leading-relaxed flex-1"
                      style={{ color: 'rgba(240,236,230,0.55)' }}
                    >
                      {cluster.description}
                    </p>

                    {/* EMERGING badge */}
                    <div className="inline-flex">
                      <span
                        className="px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.15em]"
                        style={{
                          border: '1px solid rgba(var(--soouls-accent-rgb),0.5)',
                          color: 'var(--soouls-accent)',
                          backgroundColor: 'rgba(var(--soouls-accent-rgb),0.08)',
                        }}
                      >
                        {cluster.strength === 'Dominant' ? 'Active Hub' : 'Emerging'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
