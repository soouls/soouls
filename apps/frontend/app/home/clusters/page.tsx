'use client';

import { useUser } from '@clerk/nextjs';
import {
  ChevronRight,
  GraduationCap,
  Home as HomeIcon,
  Lightbulb,
  Search,
  Sparkles,
  Sun,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';
import { useSidebar } from '../../../src/providers/sidebar-provider';
import { trpc } from '../../../src/utils/trpc';
import { CanvasLoopIcon } from '../../components/Icons';

const FILTERS = [
  { key: 'active', label: 'Most Active' },
  { key: 'updated', label: 'Recently Updated' },
  { key: 'intensity', label: 'Emotion Intensity' },
] as const;

function ClusterIcon({ index }: { index: number }) {
  const className = 'w-5 h-5';
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
      style={{ backgroundColor: '#1F1F1F', color: '#EFEDDD', fontFamily: "'Urbanist', sans-serif" }}
    >
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
              borderColor: 'rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.5)',
            }}
          >
            <CanvasLoopIcon className="h-[18px] w-[18px]" />
            <span className="hidden font-medium tracking-wide sm:inline">Canvas</span>
          </Link>
          <button
            type="button"
            onClick={() => router.push('/home')}
            className="text-white/40 hover:text-white transition-colors flex items-center gap-2"
          >
            <HomeIcon className="w-4 h-4" />
            <span>Home</span>
          </button>
          <span className="text-[var(--soouls-accent)] ml-2">/ Clusters</span>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-10 h-10 rounded-full border-2 border-white/10 hover:border-white/30 transition-all cursor-pointer overflow-hidden shadow-[0_4px_4px_rgba(0,0,0,0.25)]"
        >
          {user?.imageUrl && (
            <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
          )}
        </button>
      </header>

      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 md:px-8 relative z-10 flex flex-col pt-40 pb-24 items-stretch">
        {/* HERO WATERMARK */}
        <div className="absolute top-12 left-0 right-0 flex justify-center pointer-events-none opacity-[0.7] select-none z-0 overflow-hidden whitespace-nowrap">
          <span
            className="text-[18vw] font-urbanist font-light leading-none text-transparent tracking-widest"
            style={{ WebkitTextStroke: '1px rgba(255,255,255,0.7)' }}
          >
            Soouls
          </span>
        </div>

        <section
          className="flex-1 backdrop-blur-[48px] border-t border-white/10 rounded-t-[32px] overflow-hidden flex flex-col"
          style={{ backgroundColor: 'rgba(15, 15, 15, 0.6)' }}
        >
          {/* Main Card Header */}
          <div className="p-10 md:p-14 space-y-12">
            <div className="flex flex-col xl:flex-row justify-between items-start gap-10">
              <div className="space-y-6">
                <h1
                  className="text-[60px] leading-none italic tracking-[-0.035em]"
                  style={{ fontFamily: "'Playfair Display', serif", color: 'var(--soouls-accent)' }}
                >
                  Your thought clusters
                </h1>
                <p className="text-[28px] text-[#7A7A7A] tracking-[-0.035em]">
                  these are the spaces your thoughts naturally gather
                </p>
              </div>

              <div className="flex flex-col gap-8 items-start xl:items-end w-full xl:w-auto">
                {/* Search Bar */}
                <div
                  className="w-[509px] h-[57px] flex items-center px-7 gap-3 rounded-[48px]"
                  style={{ backgroundColor: 'rgba(230, 226, 214, 0.2)' }}
                >
                  <Search className="w-6 h-6 text-[#E6E2D6]/50" />
                  <input
                    type="text"
                    placeholder="search clusters"
                    className="bg-transparent border-none outline-none text-[26px] text-[#E6E2D6] placeholder:text-[#E6E2D6]/50 w-full"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap gap-3">
                  {FILTERS.map((option) => (
                    <button
                      type="button"
                      key={option.key}
                      onClick={() => setFilter(option.key)}
                      className={`px-8 py-2.5 rounded-full text-xs font-bold uppercase tracking-[0.2em] transition-all border ${
                        filter === option.key
                          ? 'bg-[var(--soouls-accent)]/20 border-[var(--soouls-accent)] text-[var(--soouls-accent)]'
                          : 'bg-[#1F1918]/20 border-[#A8A8A8] text-[#A8A8A8]'
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
              className="flex items-center gap-4 py-4 px-10 -mx-12 border-y border-white/5"
              style={{ backgroundColor: 'rgba(24, 24, 24, 0.71)' }}
            >
              <Sparkles className="w-6 h-6 text-[#7A7A7A]" />
              <p className="text-[28px] text-[#7A7A7A]">
                {data?.headline ?? 'Your recent thoughts are beginning to cluster.'}
              </p>
            </div>
          </div>

          <div className="flex-1 p-10 md:p-14 overflow-y-auto space-y-20 pb-32">
            {featured ? (
              <button
                type="button"
                onClick={() => router.push(`/home/clusters/${featured.id}`)}
                className="w-full text-left backdrop-blur-[75px] border border-[var(--soouls-accent)]/25 rounded-[32px] p-16 flex justify-between items-center relative group transition-all hover:bg-white/[0.02]"
                style={{
                  backgroundColor: '#222222',
                  boxShadow: '0px 4.98px 4.98px rgba(0, 0, 0, 0.25)',
                }}
              >
                <div className="flex-1 space-y-10 w-full">
                  <div className="flex items-center gap-4">
                    <div className="px-8 py-4 rounded-[60px] border border-[var(--soouls-accent)] bg-[var(--soouls-accent)]/20 text-[var(--soouls-accent)] text-[15px] font-bold">
                      {featured.strength === 'Dominant' ? 'ACTIVE HUB' : 'EMERGING'}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <GraduationCap className="w-8 h-8 text-[var(--soouls-accent)]" />
                      <h2
                        className="text-[28px] italic tracking-[-0.035em] text-[#E6E2D6]"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                      >
                        {featured.name}
                      </h2>
                    </div>
                    <p className="text-[20px] font-light leading-tight text-[#E6E2D6] max-w-2xl tracking-[-0.035em]">
                      {featured.description}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-12 lg:gap-32">
                    <div className="space-y-4">
                      <span className="text-[16px] font-light text-[#A8A8A8] tracking-[-0.035em] block uppercase">
                        EMOTION TONE
                      </span>
                      <div className="text-[16px] font-light text-[#E6E2D6]">
                        {featured.tones.join('  •     ')}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <span className="text-[16px] font-light text-[#A8A8A8] tracking-[-0.035em] block uppercase">
                        STRENGTH
                      </span>
                      <div className="text-[16px] font-light text-[var(--soouls-accent)]">
                        {featured.strength}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-[300px] h-[300px] rounded-full border border-[var(--soouls-accent)] bg-[var(--soouls-accent)]/5 flex flex-col items-center justify-center space-y-5">
                  <div
                    className="text-[60px] italic leading-none text-[#E6E2D6]"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {featured.entryCount}
                  </div>
                  <div className="text-[15px] font-bold text-[var(--soouls-accent)] tracking-[-0.035em]">
                    ENTRIES
                  </div>
                </div>
              </button>
            ) : (
              <div
                className="rounded-[32px] border border-white/5 p-16 text-center text-[20px] text-[#7A7A7A]"
                style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
              >
                Your first few entries will begin forming visible clusters here.
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {clusters.map((cluster, index) => (
                <button
                  type="button"
                  key={cluster.id}
                  onClick={() => router.push(`/home/clusters/${cluster.id}`)}
                  className="backdrop-blur-sm border border-white/5 rounded-[20px] p-8 space-y-12 text-left hover:bg-white/[0.02] transition-all flex flex-col"
                  style={{ backgroundColor: '#222222' }}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-5">
                      <h3
                        className="text-[36px] italic leading-none text-white/90"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                      >
                        {cluster.name}
                      </h3>
                      <div className="text-[16px] font-light text-white/90">
                        {cluster.entryCount} entries • {cluster.updatedAtLabel}
                      </div>
                    </div>
                    <div className="p-3 rounded-2xl bg-white/5 group-hover:bg-white/10 transition-colors">
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
                    <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-white/40 transition-all group-hover:translate-x-1" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      </main>

      <div
        className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full blur-[120px] pointer-events-none"
        style={{ backgroundColor: 'rgba(224, 122, 95, 0.05)' }}
      />
      <div
        className="absolute top-1/2 -right-20 w-80 h-80 rounded-full blur-[100px] pointer-events-none"
        style={{ backgroundColor: 'rgba(224, 122, 95, 0.06)' }}
      />
    </div>
  );
}
