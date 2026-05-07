'use client';

import { useUser } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import {
  BarChart3,
  CheckSquare,
  ChevronRight,
  Image as ImageIcon,
  LayoutGrid,
  Mic,
  Plus,
  Search,
  Target,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';
import { useSidebar } from '../../../src/providers/sidebar-provider';
import { getEntryPlainText, getEntryTitle, parseEntryData } from '../../../src/utils/entries';
import { trpc } from '../../../src/utils/trpc';
import { LeafIcon } from '../../components/Icons';

const DashboardPage = () => {
  const { user } = useUser();
  const { setIsOpen } = useSidebar();
  const router = useRouter();
  const [activeTaskTab, setActiveTaskTab] = useState<'today' | 'yesterday' | 'search'>('today');

  const { data: insights } = trpc.private.home.getInsights.useQuery(undefined);
  const { data: clusterData } = trpc.private.home.getClusters.useQuery(undefined);
  const { data: entriesData } = trpc.private.entries.getAll.useQuery({ limit: 50 });

  const entries = entriesData?.items ?? [];
  const firstEntry = entries[0];

  // Real Weekly Stats
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 7);
  const weeklyReflections = entries.filter((e) => new Date(e.createdAt) >= weekAgo).length;
  const topTheme = insights?.thoughtThemes?.[0]?.label || 'Deep Reflection';

  // Custom weekly bars with labels
  const weeklyBars = useMemo(() => {
    const weeklyWindowStart = new Date();
    weeklyWindowStart.setDate(weeklyWindowStart.getDate() - 7);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const counts = new Array(7).fill(0);
    for (const entry of entries.filter((item) => new Date(item.createdAt) >= weeklyWindowStart)) {
      counts[new Date(entry.createdAt).getDay()] += 1;
    }
    const max = Math.max(...counts, 1);
    return days.map((day, i) => ({
      label: day.toUpperCase(),
      count: counts[i],
      percent: Math.max(8, Math.round((counts[i] / max) * 100)),
    }));
  }, [entries]);

  // Real Clusters logic
  const bestCluster = clusterData?.items?.sort((a, b) => b.entryCount - a.entryCount)[0];
  const clusterEntries = entries.filter((e) => e.clusterId === bestCluster?.id).slice(0, 5);

  // Real Task Filtering - Extracting tasks from inside entries
  const processedTasks = useMemo(() => {
    const allTasks: Array<{
      id: string;
      entryId: string;
      text: string;
      done: boolean;
      date: Date;
    }> = [];

    for (const entry of entries) {
      const entryDate = new Date(entry.createdAt);

      // 1. Check if the entry itself is a task
      if (entry.type === 'task') {
        allTasks.push({
          id: entry.id,
          entryId: entry.id,
          text: getEntryTitle(entry),
          done: entry.taskStatus === 'completed',
          date: entryDate,
        });
      }

      // 2. Extract nested tasks from content blocks
      const parsed = parseEntryData(entry.content, entry.title);
      if (parsed.tasklists && parsed.tasklists.length > 0) {
        for (const tasklist of parsed.tasklists) {
          if (tasklist.tasks) {
            for (const t of tasklist.tasks) {
              if (t.text) {
                allTasks.push({
                  id: `${entry.id}-${allTasks.length}`,
                  entryId: entry.id,
                  text: t.text,
                  done: !!t.done,
                  date: entryDate,
                });
              }
            }
          }
        }
      }
    }

    // Filter by tab
    const today = new Date();
    return allTasks.filter((task) => {
      if (activeTaskTab === 'today') {
        return task.date.toDateString() === today.toDateString();
      }
      if (activeTaskTab === 'yesterday') {
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        return task.date.toDateString() === yesterday.toDateString();
      }
      return true; // Search/All
    });
  }, [entries, activeTaskTab]);

  // Calculate Real Growth (Simulated based on entries count)
  const currentMonthEntries = entries.filter(
    (e) => new Date(e.createdAt).getMonth() === now.getMonth(),
  ).length;
  const lastMonthEntries = entries.filter(
    (e) => new Date(e.createdAt).getMonth() === (now.getMonth() - 1 + 12) % 12,
  ).length;
  const growthPercent =
    lastMonthEntries === 0
      ? currentMonthEntries > 0
        ? 100
        : 0
      : Math.round(((currentMonthEntries - lastMonthEntries) / lastMonthEntries) * 100);

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden select-none"
      style={{ backgroundColor: '#1F1F1F', color: '#EFEDDD', fontFamily: "'Urbanist', sans-serif" }}
    >
      {/* BACKGROUND WATERMARK - Exact Design Parity */}
      <div className="absolute top-24 left-0 right-0 flex justify-center pointer-events-none opacity-[0.5] select-none z-0 overflow-hidden whitespace-nowrap">
        <div className="relative">
          <span
            className="text-[14vw] font-urbanist font-light leading-none text-transparent tracking-widest uppercase"
            style={{
              WebkitTextStroke: '1px rgba(255,255,255,0.2)',
            }}
          >
            Soouls in
          </span>
          {/* Floating Magenta 'R' Badge */}
          <div className="absolute top-[20%] left-[24%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-auto">
            <div className="w-10 h-10 rounded-full bg-[#FF0080] flex items-center justify-center shadow-[0_0_20px_rgba(255,0,128,0.4)] border-2 border-black/20">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <div className="w-4 h-4 bg-black/80 rotate-45 -mt-2 border-r border-b border-white/5" />
          </div>
        </div>
      </div>

      {/* HEADER - Exact Design Parity */}
      <header className="fixed top-0 left-0 right-0 z-50 p-10 flex justify-between items-center transition-all duration-300">
        <div className="flex items-center gap-1 text-[22px] font-medium tracking-tight">
          <button
            type="button"
            onClick={() => router.push('/home')}
            className="text-white/30 hover:text-white/60 transition-all cursor-pointer"
          >
            Home
          </button>
          <span className="text-white/30">/</span>
          <span className="text-[#E07A5F]">Dashboard</span>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-12 h-12 rounded-full border border-white/10 hover:border-white/30 transition-all cursor-pointer overflow-hidden shadow-2xl"
        >
          {user?.imageUrl ? (
            <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-[#E07A5F]/20 flex items-center justify-center text-[#E07A5F] font-bold">
              {user?.firstName?.[0] || 'S'}
            </div>
          )}
        </button>
      </header>

      {/* MAIN CONTAINER - Standardized */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 md:px-8 relative z-10 flex flex-col pt-32 pb-24 items-stretch">
        <section
          className="flex-1 backdrop-blur-[48px] rounded-[40px] overflow-hidden flex flex-col"
          style={{ backgroundColor: 'rgba(10, 10, 10, 0.4)' }}
        >
          <div className="flex-1 p-8 md:p-10 space-y-10 overflow-y-auto custom-scrollbar">
            {/* WRITING SECTION - Matching Design Exactly */}
            <div className="space-y-6">
              <h2 className="text-[20px] font-medium text-white/90 px-2">Let's start New Entry</h2>
              <div className="w-full bg-[#111111] border border-white/[0.05] rounded-[24px] p-8 flex flex-col min-h-[220px] transition-all group relative">
                <span className="text-[24px] text-white/20 font-light mb-auto">
                  Write something to start
                </span>
                <div className="flex items-center justify-between mt-10">
                  <div className="flex items-center gap-10">
                    <button
                      type="button"
                      className="flex items-center gap-2.5 text-[#A78BFA] hover:opacity-80 transition-all"
                    >
                      <Mic className="w-5 h-5" />
                      <span className="text-[16px] font-medium">Voice note</span>
                    </button>
                    <button
                      type="button"
                      className="flex items-center gap-2.5 text-[#E07A5F] hover:opacity-80 transition-all"
                    >
                      <ImageIcon className="w-5 h-5" />
                      <span className="text-[16px] font-medium">Image</span>
                    </button>
                    <button
                      type="button"
                      className="flex items-center gap-2.5 text-[#34D399] hover:opacity-80 transition-all"
                    >
                      <CheckSquare className="w-5 h-5" />
                      <span className="text-[16px] font-medium">Task</span>
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push('/home/new-entry');
                    }}
                    className="px-8 py-3 rounded-full border border-white/10 text-white/90 text-[16px] font-medium hover:bg-white/5 transition-all flex items-center gap-2"
                    style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                  >
                    <Plus className="w-4 h-4" />
                    Create New Entry
                  </button>
                </div>
              </div>
            </div>

            {/* BENTO GRID - Matching Design Spacing */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* COLUMN 1 & 2 AREA (Left + Middle) */}
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* 1. MEDITATION STREAK */}
                <div className="bg-[#111111] border border-white/[0.05] rounded-[24px] p-8 flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[18px] font-medium text-white/90">
                      60 Reflection Challenge
                    </h3>
                    <Target className="w-5 h-5 text-[#E07A5F]" />
                  </div>
                  <div className="space-y-4">
                    <div className="text-[16px] text-[#E07A5F] font-medium">
                      {Math.max(0, 60 - entries.length)} entries left
                    </div>
                    <div className="w-full h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (entries.length / 60) * 100)}%` }}
                        className="h-full bg-gradient-to-r from-[#E07A5F] to-[#D46B4E]"
                      />
                    </div>
                    <div className="flex justify-between text-[14px] text-white/40 font-medium">
                      <span>{entries.length} written</span>
                      <span>60 goal</span>
                    </div>
                  </div>
                </div>

                {/* 2. JOURNAL GOAL */}
                <div className="bg-[#111111] border border-white/[0.05] rounded-[24px] p-8 flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[18px] font-medium text-white/90">
                      30 Reflection Challenge
                    </h3>
                    <Target className="w-5 h-5 text-[#E07A5F]" />
                  </div>
                  <div className="space-y-4">
                    <div className="text-[16px] text-[#E07A5F] font-medium">
                      {entries.length >= 30
                        ? 'Challenge Completed!'
                        : `${Math.max(0, 30 - entries.length)} entries left`}
                    </div>
                    <div className="w-full h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (entries.length / 30) * 100)}%` }}
                        className="h-full bg-gradient-to-r from-[#E07A5F] to-[#D46B4E]"
                      />
                    </div>
                    <div className="flex justify-between text-[14px] text-white/40 font-medium">
                      <span>{entries.length} written</span>
                      <span>30 goal</span>
                    </div>
                  </div>
                </div>

                {/* 3. CLUSTER PREVIEW (THE MIDNIGHT ECHOS) */}
                <div className="bg-[#111111] border border-white/[0.05] rounded-[24px] p-8 flex flex-col gap-6 relative overflow-hidden group cursor-pointer hover:border-white/10 transition-all">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[18px] font-medium text-white/90">
                      {bestCluster?.name || 'The Midnight Echos'}
                    </h3>
                    <ChevronRight className="w-5 h-5 text-white/40" />
                  </div>

                  <div className="flex-1 rounded-[20px] bg-[#0A0A0A] border border-white/[0.03] relative p-6 overflow-hidden min-h-[350px]">
                    <svg
                      aria-hidden="true"
                      className="absolute inset-0 w-full h-full pointer-events-none opacity-20"
                    >
                      <line x1="20%" y1="20%" x2="50%" y2="50%" stroke="#E07A5F" strokeWidth="1" />
                      <line x1="80%" y1="20%" x2="50%" y2="50%" stroke="#E07A5F" strokeWidth="1" />
                      <line x1="15%" y1="75%" x2="50%" y2="50%" stroke="#E07A5F" strokeWidth="1" />
                      <line x1="85%" y1="80%" x2="50%" y2="50%" stroke="#E07A5F" strokeWidth="1" />
                    </svg>

                    {/* Real Graph Nodes from Cluster Entries */}
                    {clusterEntries.map((entry, index) => {
                      type ClusterCardPosition = {
                        top?: string;
                        left?: string;
                        right?: string;
                        bottom?: string;
                        transform?: string;
                        zIndex: number;
                        width: string;
                        bg: string;
                        border: string;
                        opacity?: number;
                      };

                      const fallbackPosition: ClusterCardPosition = {
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 10,
                        width: '110px',
                        bg: 'white/0.02',
                        border: 'white/5',
                        opacity: 0.4,
                      };

                      const positions: ClusterCardPosition[] = [
                        {
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          zIndex: 30,
                          width: '160px',
                          bg: '#E07A5F/5',
                          border: '#E07A5F/20',
                        },
                        {
                          top: '10%',
                          left: '10%',
                          zIndex: 10,
                          width: '110px',
                          bg: 'white/0.02',
                          border: 'white/5',
                          opacity: 0.4,
                        },
                        {
                          top: '12%',
                          right: '10%',
                          zIndex: 10,
                          width: '110px',
                          bg: 'white/0.02',
                          border: 'white/5',
                          opacity: 0.4,
                        },
                        {
                          top: '15%',
                          left: '12%',
                          zIndex: 10,
                          width: '110px',
                          bg: 'white/0.02',
                          border: 'white/5',
                          opacity: 0.4,
                        },
                        {
                          top: '18%',
                          right: '12%',
                          zIndex: 10,
                          width: '110px',
                          bg: 'white/0.02',
                          border: 'white/5',
                          opacity: 0.4,
                        },
                      ];

                      const pos =
                        positions[index] ??
                        positions[0] ??
                        positions[positions.length - 1] ??
                        fallbackPosition;

                      return (
                        <div
                          key={entry.id}
                          className="absolute p-3 rounded-xl backdrop-blur-sm transition-all hover:scale-105 hover:opacity-100"
                          style={{
                            top: pos.top || 'auto',
                            left: pos.left || 'auto',
                            right: pos.right || 'auto',
                            bottom: pos.bottom || 'auto',
                            transform: pos.transform,
                            zIndex: pos.zIndex,
                            width: pos.width,
                            backgroundColor:
                              index === 0
                                ? 'rgba(224, 122, 95, 0.08)'
                                : 'rgba(255, 255, 255, 0.02)',
                            border:
                              index === 0
                                ? '1px solid rgba(224, 122, 95, 0.2)'
                                : '1px solid rgba(255, 255, 255, 0.05)',
                            opacity: index === 0 ? 1 : 0.4,
                          }}
                        >
                          <div
                            className={`text-[6px] mb-0.5 uppercase font-bold ${index === 0 ? 'text-[#E07A5F]' : 'text-white/30'}`}
                          >
                            {new Date(entry.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </div>
                          <div
                            className={`text-[10px] font-bold mb-0.5 truncate ${index === 0 ? 'text-white' : 'text-white/70'}`}
                          >
                            {getEntryTitle(entry)}
                          </div>
                          <div className="text-[8px] text-white/30 line-clamp-2 leading-relaxed">
                            {getEntryPlainText(entry)}
                          </div>
                        </div>
                      );
                    })}

                    {!clusterEntries.length && (
                      <div className="absolute inset-0 flex items-center justify-center text-white/20 text-sm font-light italic">
                        Your cluster map will appear as you write more.
                      </div>
                    )}

                    {/* Bottom Controls */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 w-full px-4">
                      <div className="flex items-center gap-2 p-1 rounded-full bg-black/60 border border-white/10 backdrop-blur-md">
                        <button
                          type="button"
                          className="px-3 py-1 text-[10px] text-white/40 uppercase font-bold hover:text-white transition-colors flex items-center gap-1"
                        >
                          <Plus className="w-2.5 h-2.5" /> CREATE
                        </button>
                        <div className="w-[1px] h-3 bg-white/10" />
                        <div className="px-3 py-1 text-[10px] text-[#E07A5F] uppercase font-bold">
                          CD
                        </div>
                        <div className="w-[1px] h-3 bg-white/10" />
                        <button
                          type="button"
                          className="p-1 text-white/40 hover:text-white transition-colors"
                        >
                          <LayoutGrid className="w-3.5 h-3.5" />
                        </button>
                        <div className="w-[1px] h-3 bg-white/10" />
                        <button
                          type="button"
                          className="p-1 text-white/40 hover:text-white transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button
                        type="button"
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#E07A5F]/10 border border-[#E07A5F]/30 rounded-full text-[#E07A5F] text-[12px] font-bold hover:bg-[#E07A5F] hover:text-white transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Start New Cluster
                      </button>
                    </div>
                  </div>
                </div>

                {/* 4. TODAY'S TASKS */}
                <div className="bg-[#111111] border border-white/[0.05] rounded-[24px] p-8 flex flex-col">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-[18px] font-medium text-white/90">Today's Tasks</h3>
                    <ChevronRight className="w-5 h-5 text-white/40" />
                  </div>

                  <div className="flex gap-6 mb-8 min-h-[350px]">
                    <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-2">
                      {processedTasks.length > 0 ? (
                        processedTasks.map((task) => (
                          <button
                            type="button"
                            key={task.id}
                            className="flex w-full items-center gap-4 group cursor-pointer p-3 rounded-xl bg-white/[0.01] border border-white/[0.03] hover:border-white/10 transition-all text-left"
                            onClick={() => router.push(`/home/new-entry?id=${task.entryId}`)}
                          >
                            <div
                              className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${task.done ? 'bg-[#E07A5F] border-[#E07A5F]' : 'border-white/20'}`}
                            >
                              {task.done && <CheckSquare className="w-3.5 h-3.5 text-white" />}
                            </div>
                            <div className="flex-1">
                              <p
                                className={`text-[14px] font-medium transition-all ${task.done ? 'text-white/40 line-through' : 'text-white/80'}`}
                              >
                                {task.text}
                              </p>
                            </div>
                            <div className="text-[11px] text-white/20 font-medium whitespace-nowrap">
                              {task.date.toDateString() === new Date().toDateString()
                                ? 'Today'
                                : 'Recently'}
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-white/10 text-[14px] italic border-2 border-dashed border-white/5 rounded-2xl">
                          No tasks found for this period
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setActiveTaskTab('today')}
                        className={`w-full px-6 py-3 rounded-xl text-[14px] font-bold transition-all ${activeTaskTab === 'today' ? 'bg-[#E07A5F] text-white' : 'bg-[#1A1A1A] text-white/40'}`}
                      >
                        Today
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTaskTab('yesterday')}
                        className={`w-full px-6 py-3 rounded-xl text-[14px] font-bold transition-all ${activeTaskTab === 'yesterday' ? 'bg-[#E07A5F] text-white' : 'bg-[#1A1A1A] text-white/40'}`}
                      >
                        Yesterday
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTaskTab('search')}
                        className={`w-full px-6 py-3 rounded-xl text-[14px] font-bold transition-all ${activeTaskTab === 'search' ? 'bg-[#E07A5F] text-white' : 'bg-[#1A1A1A] text-white/40'} flex items-center gap-2 justify-center`}
                      >
                        <Search className="w-3.5 h-3.5" />
                        Search
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="text-[#E07A5F] text-[14px] font-medium hover:underline text-left mt-auto"
                    onClick={() => router.push('/home/entries')}
                  >
                    View all Tasks
                  </button>
                </div>

                {/* 5. REFLECTION HIGHLIGHT (Wide) */}
                <div className="md:col-span-2 bg-[#1A1817] border border-[#E07A5F]/10 rounded-[24px] p-10 relative overflow-hidden group">
                  <div className="flex items-center gap-8 relative z-10 mb-6">
                    <div className="w-20 h-20 rounded-[24px] bg-[#E07A5F]/5 border border-[#E07A5F]/10 flex items-center justify-center shrink-0">
                      <LeafIcon className="w-10 h-10 text-[#E07A5F]" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-[28px] leading-tight text-white/95 font-medium">
                        You reflected{' '}
                        <span className="text-[#E07A5F] font-bold">{weeklyReflections} times</span>{' '}
                        this week.
                      </h2>
                      <h3 className="text-[22px] text-white/80">
                        Top pattern detected:{' '}
                        <span className="text-[#E07A5F] font-bold italic">"{topTheme}"</span>
                      </h3>
                    </div>
                  </div>

                  <div className="relative z-10 p-6 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm">
                    <p className="text-[18px] text-white/50 font-light leading-relaxed italic">
                      {insights?.monthlyAnalysis ||
                        `You've shown strong alignment with "${topTheme.toLowerCase()}" lately. Your entries suggest a ${growthPercent > 0 ? 'growing' : 'stable'} focus on this area, with an increase of ${Math.abs(growthPercent)}% in recurring patterns compared to last month.`}
                    </p>
                  </div>
                </div>
              </div>

              {/* COLUMN 3 AREA (Right) */}
              <div className="lg:col-span-1 flex flex-col gap-8">
                {/* 6. RECENT ENTRIES */}
                <div className="bg-[#111111] border border-white/[0.05] rounded-[24px] p-8 flex flex-col gap-8 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[18px] font-medium text-white/90">Recent Entries</h3>
                    <ChevronRight className="w-5 h-5 text-white/40" />
                  </div>

                  <div className="flex-1 flex flex-col justify-center gap-6">
                    <p className="text-[20px] font-urbanist italic leading-[1.6] text-white/50 font-light">
                      {firstEntry
                        ? `"${getEntryPlainText(firstEntry).slice(0, 200)}..."`
                        : '"Start your journey by writing your first entry. Every thought counts towards your personal growth."'}
                    </p>
                    <div className="text-[24px] font-bold text-[#E07A5F] uppercase tracking-[0.1em]">
                      {firstEntry
                        ? new Date(firstEntry.createdAt).toDateString() ===
                          new Date().toDateString()
                          ? 'Today'
                          : new Date(firstEntry.createdAt).toLocaleDateString('en-US', {
                              weekday: 'long',
                            })
                        : 'Ready'}
                    </div>
                  </div>
                </div>

                {/* 7. RECENT ACTIVITY (Graph) */}
                <div className="bg-[#111111] border border-white/[0.05] rounded-[24px] p-8 flex flex-col gap-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[18px] font-medium text-white/90">Recent Activity</h3>
                    <div className="flex items-center gap-2 text-white/40 text-[12px] bg-white/[0.03] px-3 py-1.5 rounded-full cursor-pointer hover:bg-white/[0.08] transition-all">
                      <span>Last 7 Days</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="text-[24px] font-medium text-white/90">Your Frequency</div>
                    <div className="flex items-end justify-between h-[180px] px-2 gap-3">
                      {weeklyBars.map((bar, idx) => (
                        <div
                          key={bar.label}
                          className="flex-1 flex flex-col items-center gap-4 h-full group"
                        >
                          <div className="relative w-full max-w-[14px] flex-1 flex flex-col justify-end bg-white/[0.03] rounded-full overflow-hidden">
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${bar.percent}%` }}
                              className={`w-full rounded-full transition-all duration-700 group-hover:brightness-125 ${idx === now.getDay() ? 'bg-[#E07A5F]' : 'bg-white/20'}`}
                            />
                          </div>
                          <span
                            className={`text-[10px] font-bold uppercase tracking-tighter ${idx === now.getDay() ? 'text-[#E07A5F]' : 'text-white/20'}`}
                          >
                            {bar.label}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-3 py-2.5 px-5 bg-[#E07A5F]/20 border border-[#E07A5F]/30 rounded-full justify-center">
                      <BarChart3 className="w-4 h-4 text-[#E07A5F]" />
                      <span className="text-[14px] font-bold text-[#E07A5F]">
                        {weeklyReflections} entries this week
                      </span>
                    </div>
                  </div>
                </div>
              </div>
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

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(224, 122, 95, 0.2);
        }
      `}</style>
    </div>
  );
};

export default DashboardPage;
