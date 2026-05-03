'use client';

import { useUser } from '@clerk/nextjs';
import type { UserEntry } from '@soouls/api/router';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Mic, 
  ImageIcon, 
  ListTodo, 
  Plus, 
  ChevronRight, 
  CheckCircle2, 
  Clock,
  ChevronDown,
  History,
  Search
} from 'lucide-react';
import { useSidebar } from '../../../src/providers/sidebar-provider';
import { trpc } from '../../../src/utils/trpc';
import { CanvasLoopIcon, LeafIcon } from '../../components/Icons';
import { getEntryPlainText, getEntryTitle } from '../../../src/utils/entries';
import { buildActivityBars } from '../../../src/utils/home';

function avatarFor(seed?: string | null) {
  return `https://api.dicebear.com/9.x/glass/svg?seed=${encodeURIComponent(seed || 'Soouls')}&backgroundColor=1c1c1c,e07a5f&radius=50`;
}

function entryTitle(entry: UserEntry) {
  return getEntryTitle(entry);
}

const DashboardPage = () => {
  const { user } = useUser();
  const { setIsOpen } = useSidebar();
  const [scrolled, setScrolled] = useState(false);
  const [taskFilter, setTaskFilter] = useState<'Today' | 'Yesterday' | 'Search'>('Today');

  const { data: insights } = trpc.private.home.getInsights.useQuery(undefined);
  const { data: entriesData } = trpc.private.entries.getAll.useQuery({ limit: 15 });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const avatarUrl = user?.imageUrl || avatarFor(user?.primaryEmailAddress?.emailAddress || user?.id);
  const entries = entriesData?.items ?? [];
  const tasks = entries.filter(e => e.type === 'task').slice(0, 5);
  const activityBars = buildActivityBars(entries);

  return (
    <div 
      className="relative flex min-h-screen flex-col overflow-x-hidden selection:bg-[rgba(224,122,95,0.2)]"
      style={{ backgroundColor: '#0D0D0D', color: '#EFEBDD' }}
    >
      {/* BACKGROUND SOOULS TEXT */}
      <div className="absolute top-0 left-0 w-full flex justify-center pointer-events-none select-none z-0 pt-10">
         <h1 className="text-[14vw] font-bold tracking-[-0.05em] leading-none text-white/[0.03] uppercase whitespace-nowrap" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.05)', color: 'transparent' }}>
            SOOULS
         </h1>
      </div>

      <header className={`fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 transition-all duration-300 md:px-12 ${scrolled ? 'py-4 backdrop-blur-xl border-b border-white/5 bg-black/40' : 'py-10 bg-transparent'}`}>
        <div className="flex items-center gap-1 text-2xl font-medium tracking-tight">
          <span className="text-white/40">Home</span>
          <span className="text-white/20">/</span>
          <span className="text-[#E07A5F]">Dashboard</span>
        </div>
        <div className="flex items-center gap-4">
           <Link href="/home/canvas" className="hidden md:block">
              <CanvasLoopIcon className="w-6 h-6 text-white/40 hover:text-white transition-colors" />
           </Link>
           <button onClick={() => setIsOpen(true)} className="h-10 w-10 overflow-hidden rounded-full border border-white/10 transition-transform hover:scale-105 active:scale-95">
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
           </button>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-center pt-40 pb-24 px-4 md:px-12">
        <div className="w-full max-w-[1240px] flex flex-col gap-8">
          
          {/* NEW ENTRY CARD */}
          <section className="w-full">
            <div className="rounded-[28px] bg-[#141414] border border-white/[0.04] p-8 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)]">
              <h2 className="text-[14px] font-medium text-white/50 mb-6">Let's start New Entry</h2>
              <div className="rounded-[18px] bg-[#181818] border border-white/[0.02] p-6 mb-2">
                 <textarea 
                   placeholder="Write something to start"
                   className="w-full bg-transparent border-none focus:ring-0 text-lg text-white/80 placeholder:text-white/10 min-h-[110px] resize-none"
                 />
                 <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
                    <div className="flex items-center gap-6">
                       <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 hover:text-[#E07A5F] transition-colors group">
                          <div className="p-1.5 rounded-md bg-white/[0.03] group-hover:bg-[#E07A5F]/10"><Mic className="w-3.5 h-3.5 text-[#E07A5F]" /></div> Voice note
                       </button>
                       <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 hover:text-[#E07A5F] transition-colors group">
                          <div className="p-1.5 rounded-md bg-white/[0.03] group-hover:bg-[#E07A5F]/10"><ImageIcon className="w-3.5 h-3.5 text-[#E07A5F]" /></div> Image
                       </button>
                       <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 hover:text-[#E07A5F] transition-colors group">
                          <div className="p-1.5 rounded-md bg-white/[0.03] group-hover:bg-[#E07A5F]/10"><ListTodo className="w-3.5 h-3.5 text-[#E07A5F]" /></div> Task
                       </button>
                    </div>
                    <Link 
                      href="/home/new-entry"
                      className="px-7 py-3 rounded-full border border-[#E07A5F]/40 bg-[#E07A5F]/5 text-[10px] font-bold uppercase tracking-[0.2em] text-white hover:bg-[#E07A5F]/20 transition-all flex items-center gap-3"
                    >
                      <Plus className="w-3.5 h-3.5" /> Create New Entry
                    </Link>
                 </div>
              </div>
            </div>
          </section>

          {/* GRID LAYOUT */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT COLUMN */}
            <div className="lg:col-span-8 flex flex-col gap-8">
              
              {/* GOALS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                 <div className="rounded-[28px] bg-[#141414] border border-white/[0.04] p-8 flex flex-col justify-between h-[180px] group transition-all hover:border-white/10">
                    <div className="flex justify-between items-start">
                       <div>
                          <h3 className="text-[15px] font-semibold text-white/90">60 Day Meditation Streak</h3>
                          <p className="text-[11px] font-bold text-[#E07A5F] mt-2 uppercase tracking-widest">28 days left</p>
                       </div>
                       <Clock className="w-4 h-4 text-white/20" />
                    </div>
                    <div className="space-y-3">
                       <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: '46%' }} className="h-full bg-[#E07A5F] rounded-full" />
                       </div>
                       <div className="flex justify-end">
                          <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">46% completed</span>
                       </div>
                    </div>
                 </div>

                 <div className="rounded-[28px] bg-[#141414] border border-white/[0.04] p-8 flex flex-col justify-between h-[180px] group transition-all hover:border-white/10">
                    <div className="flex justify-between items-start">
                       <div>
                          <h3 className="text-[15px] font-semibold text-white/90">Write 30 Journal Entries</h3>
                          <p className="text-[11px] font-bold text-[#E07A5F] mt-2 uppercase tracking-widest">Ends Jan 2025</p>
                       </div>
                       <Clock className="w-4 h-4 text-white/20" />
                    </div>
                    <div className="space-y-3">
                       <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: '40%' }} className="h-full bg-[#E07A5F] rounded-full" />
                       </div>
                       <div className="flex justify-end">
                          <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">12 of 30 written</span>
                       </div>
                    </div>
                 </div>
              </div>

              {/* CLUSTER PREVIEW */}
              <div className="rounded-[28px] bg-[#141414] border border-white/[0.04] p-10 min-h-[340px] flex flex-col group overflow-hidden relative">
                 <div className="flex justify-between items-center mb-8 relative z-10">
                    <h2 className="text-[16px] font-semibold text-white/80">The Midnight Echos</h2>
                    <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-white transition-colors" />
                 </div>
                 <div className="flex-1 relative rounded-[20px] overflow-hidden bg-black/60 border border-white/5 shadow-inner">
                    <div className="absolute inset-0 opacity-20 mix-blend-screen bg-[url('https://api.dicebear.com/9.x/shapes/svg?seed=Clusters&backgroundColor=0d0d0d')] bg-cover" />
                    <div className="absolute inset-0 flex items-center justify-center">
                       <div className="relative w-full h-full p-8">
                          {/* Visual Cluster Boxes */}
                          <div className="absolute top-[20%] left-[10%] p-4 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-md max-w-[150px] shadow-2xl">
                             <span className="text-[8px] font-bold uppercase tracking-widest text-white/20 block mb-1">Nov 24, 2024</span>
                             <p className="text-[10px] text-white/70 leading-tight">The idea flow starts with stillness...</p>
                          </div>
                          <div className="absolute top-[10%] right-[15%] p-4 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-md max-w-[160px] shadow-2xl">
                             <span className="text-[8px] font-bold uppercase tracking-widest text-white/20 block mb-1">Yesterday</span>
                             <p className="text-[10px] text-white/70 leading-tight">Reflecting on the core essence of Souls...</p>
                          </div>
                          <div className="absolute bottom-[30%] left-1/2 -translate-x-1/2 p-6 rounded-2xl bg-[#E07A5F]/10 border border-[#E07A5F]/30 backdrop-blur-xl max-w-[200px] text-center shadow-[0_20px_50px_rgba(224,122,95,0.2)]">
                             <p className="text-[11px] font-playfair italic text-[#EFEBDD]">Deep Internal Recognition</p>
                             <div className="mt-3 flex justify-center gap-1">
                                <div className="w-1 h-1 rounded-full bg-[#E07A5F]" />
                                <div className="w-1 h-1 rounded-full bg-white/20" />
                             </div>
                          </div>
                       </div>
                    </div>
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                       <button className="px-8 py-3 rounded-full bg-[#E07A5F] text-[10px] font-bold uppercase tracking-[0.2em] text-white shadow-[0_15px_30px_rgba(224,122,95,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
                          <Plus className="w-4 h-4" /> Start New Cluster
                       </button>
                    </div>
                 </div>
              </div>

              {/* TASKS */}
              <div className="rounded-[28px] bg-[#141414] border border-white/[0.04] p-10 flex gap-8">
                 <div className="flex-1">
                    <div className="flex justify-between items-center mb-8">
                       <h2 className="text-[16px] font-semibold text-white/80">Today's Tasks</h2>
                       <ChevronRight className="w-5 h-5 text-white/20" />
                    </div>
                    <div className="space-y-3">
                       {tasks.length > 0 ? tasks.map((task, i) => (
                         <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.03] group hover:bg-white/[0.04] transition-all">
                            <div className="flex items-center gap-4">
                               <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${i % 3 === 0 ? 'bg-[#E07A5F] border-[#E07A5F]' : 'border-white/20 group-hover:border-white/40'}`}>
                                  {i % 3 === 0 && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                               </div>
                               <span className={`text-[14px] ${i % 3 === 0 ? 'text-white/30 line-through' : 'text-white/80'}`}>{getEntryTitle(task)}</span>
                            </div>
                            <span className="text-[10px] font-bold text-white/10 uppercase tracking-widest">Today</span>
                         </div>
                       )) : (
                         [1,2,3,4,5].map(i => (
                           <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.01] border border-white/[0.02]">
                              <div className="flex items-center gap-4">
                                 <div className="w-5 h-5 rounded-md border border-white/10" />
                                 <div className="h-4 w-48 bg-white/5 rounded-full animate-pulse" />
                              </div>
                           </div>
                         ))
                       )}
                    </div>
                    <button className="mt-8 text-[11px] font-bold uppercase tracking-[0.3em] text-white/20 hover:text-white transition-colors">
                       View all Tasks
                    </button>
                 </div>
                 
                 {/* TASK FILTERS */}
                 <div className="flex flex-col gap-2 pt-14">
                    <button 
                      onClick={() => setTaskFilter('Today')}
                      className={`px-8 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all ${taskFilter === 'Today' ? 'bg-[#E07A5F] text-white shadow-lg' : 'bg-white/5 text-white/20 hover:bg-white/10'}`}
                    >
                      Today
                    </button>
                    <button 
                      onClick={() => setTaskFilter('Yesterday')}
                      className={`px-8 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all ${taskFilter === 'Yesterday' ? 'bg-[#E07A5F] text-white shadow-lg' : 'bg-white/5 text-white/20 hover:bg-white/10'}`}
                    >
                      Yesterday
                    </button>
                    <button 
                      onClick={() => setTaskFilter('Search')}
                      className="px-8 py-3 rounded-xl bg-white/5 text-white/20 text-[11px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                    >
                      <Search className="w-3.5 h-3.5" /> Search days
                    </button>
                 </div>
              </div>

              {/* SUMMARY BANNER */}
              <div className="rounded-[28px] bg-gradient-to-r from-[#221B18] to-[#141414] border border-[#E07A5F]/10 p-10 flex items-center gap-8 group">
                 <div className="w-16 h-16 rounded-full bg-[#E07A5F]/10 flex items-center justify-center border border-[#E07A5F]/20 group-hover:scale-105 transition-transform duration-500">
                    <LeafIcon className="w-6 h-6 text-[#E07A5F]" />
                 </div>
                 <div>
                    <h3 className="text-[22px] md:text-[26px] font-urbanist leading-tight text-white/90">
                       You reflected <span className="text-[#E07A5F] font-semibold">5 times</span> this week. <br />
                       Most common theme: <span className="text-[#E07A5F] font-semibold">{insights?.overview.mostActivePeriod || 'Career Growth'}</span>
                    </h3>
                    <p className="text-[13px] text-white/40 mt-3 italic font-light max-w-xl">
                       Your thoughts on "{insights?.thoughtThemes[0]?.label || 'skill development'}" have grown by 20% since last month.
                    </p>
                 </div>
              </div>

            </div>

            {/* RIGHT COLUMN */}
            <div className="lg:col-span-4 flex flex-col gap-8">
              
              {/* RECENT ENTRIES */}
              <div className="rounded-[28px] bg-[#141414] border border-white/[0.04] p-10 flex flex-col h-full min-h-[400px]">
                 <div className="flex justify-between items-center mb-12">
                    <h2 className="text-[16px] font-semibold text-white/40">Recent Entries</h2>
                    <ChevronRight className="w-5 h-5 text-white/20" />
                 </div>
                 
                 <div className="flex-1 flex flex-col justify-center">
                    <blockquote className="text-[22px] font-playfair italic leading-relaxed text-white/80">
                       "{entries.length > 0 ? getEntryPlainText(entries[0]).slice(0, 160) + (getEntryPlainText(entries[0]).length > 160 ? '...' : '') : "In the stillness of the morning, clarity arrives without effort. Today reminded me of that..."}"
                    </blockquote>
                    <div className="mt-10">
                       <span className="text-[16px] font-bold text-[#E07A5F] tracking-[0.2em] uppercase">
                          {entries.length > 0 ? new Date(entries[0].createdAt).toLocaleDateString('en-US', { weekday: 'long' }) : 'Today'}
                       </span>
                    </div>
                 </div>
              </div>

              {/* RECENT ACTIVITY */}
              <div className="rounded-[28px] bg-[#141414] border border-white/[0.04] p-10 flex flex-col">
                 <div className="flex justify-between items-start mb-10">
                    <h2 className="text-[16px] font-semibold text-white/40">Recent Activity</h2>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.06] text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-white transition-all">
                       Yesterday <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                 </div>
                 
                 <div className="mb-10">
                    <h3 className="text-3xl font-playfair italic text-white/90">Sunday</h3>
                 </div>

                 <div className="flex justify-between items-end h-[280px] gap-3 mb-10 px-2">
                    {activityBars.length > 0 ? activityBars.slice(0, 7).map((val, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-5">
                         <div className="w-full bg-white/[0.03] rounded-full relative overflow-hidden" style={{ height: '100%' }}>
                            <motion.div 
                               initial={{ height: 0 }}
                               animate={{ height: `${val}%` }}
                               transition={{ duration: 1, delay: i * 0.1 }}
                               className={`absolute bottom-0 w-full rounded-full ${i === 6 ? 'bg-[#E07A5F] shadow-[0_10px_25px_rgba(224,122,95,0.4)]' : 'bg-white/20'}`}
                            />
                         </div>
                         <span className="text-[10px] font-bold text-white/20 uppercase tracking-tighter">{"SMTWTFS"[i]}</span>
                      </div>
                    )) : [40, 60, 30, 80, 50, 90, 70].map((val, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-5">
                         <div className="w-full bg-white/[0.03] rounded-full" style={{ height: '100%' }}>
                            <div className={`w-full bg-white/20 rounded-full`} style={{ height: `${val}%`, marginTop: `${100-val}%` }} />
                         </div>
                         <span className="text-[10px] font-bold text-white/20 uppercase">{"SMTWTFS"[i]}</span>
                      </div>
                    ))}
                 </div>

                 <div className="flex justify-center">
                    <button className="px-8 py-3 rounded-full bg-[#E07A5F]/10 border border-[#E07A5F]/20 flex items-center gap-3 group hover:bg-[#E07A5F]/20 transition-all">
                       <div className="p-1.5 rounded-full bg-[#E07A5F]/20 group-hover:scale-110 transition-transform">
                          <History className="w-3 h-3 text-[#E07A5F]" />
                       </div>
                       <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/80">{insights?.overview.weeklyEntryCount || 5} entries this week</span>
                    </button>
                 </div>
              </div>

            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        body {
          background-color: #0D0D0D;
          font-family: 'Urbanist', sans-serif;
          -webkit-font-smoothing: antialiased;
        }
      `}</style>
    </div>
  );
};

export default DashboardPage;