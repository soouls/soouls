'use client';

import { useUser } from '@clerk/nextjs';
import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Mic, 
  ImageIcon, 
  ListTodo, 
  Plus, 
  ChevronRight, 
  Target, 
  History,
  Search,
  CheckCircle2,
  Circle,
  TrendingUp,
  Sparkles
} from 'lucide-react';

// Mock user hook since we are in a single-file environment
// const useUser = () => ({
//   user: {
//     imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
//     firstName: "User"
//   }
// });

const DashboardPage = () => {
  const { user } = useUser();
  const [entryText, setEntryText] = useState("");

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#E0E0E0] font-sans selection:bg-[#FF7A59]/30">
      {/* Background Watermark */}
      <div className="fixed top-[-50px] left-0 right-0 flex justify-center pointer-events-none select-none z-0">
        <h1 
          className="text-[22vw] leading-none text-transparent tracking-tighter opacity-10"
          style={{
            fontFamily: 'serif',
            WebkitTextStroke: '2px rgba(255,255,255,0.4)',
          }}
        >
          Soouls in
        </h1>
      </div>

      {/* Header */}
      <header className="px-8 py-6 flex justify-between items-center relative z-20 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2 text-sm text-white/40 font-medium">
              <Link
            href="/home"
            className="text-white/40 hover:text-white transition-colors"
          >
            Home
          </Link>
          <span>/</span>
          <span className="text-[#FF7A59]">Dashboard</span>
        </div>

              <button
            // onClick={() => setIsOpen(true)}
            className="w-10 h-10 rounded-full border-2 border-white/10 hover:border-white/30 transition-all cursor-pointer overflow-hidden shadow-[0_4px_4px_rgba(0,0,0,0.25)]"
          >
            <img
              src={user?.imageUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          </button>
      </header>

      {/* Main Dashboard Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-8 pb-12 grid grid-cols-12 gap-6">
        
        {/* NEW ENTRY SECTION */}
        <section className="col-span-12 lg:col-span-12 bg-zinc-900/40 border border-white/5 rounded-3xl p-6 backdrop-blur-sm">
          <h2 className="text-sm font-medium text-zinc-400 mb-4">Let's start New Entry</h2>
          <div className="bg-zinc-800/30 border border-white/5 rounded-2xl p-4 min-h-[160px] flex flex-col justify-between">
            <textarea 
              value={entryText}
              onChange={(e) => setEntryText(e.target.value)}
              placeholder="Write something to start"
              className="bg-transparent border-none focus:ring-0 w-full resize-none text-lg text-white placeholder:text-zinc-600"
            />
            <div className="flex justify-between items-center pt-4 border-t border-white/5">
              <div className="flex gap-4">
                <button className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-[#FF7A59] transition-colors">
                  <Mic className="w-4 h-4 text-[#FF7A59]" /> Voice note
                </button>
                <button className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-orange-300 transition-colors">
                  <ImageIcon className="w-4 h-4 text-orange-300" /> Image
                </button>
                <button className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-blue-400 transition-colors">
                  <ListTodo className="w-4 h-4 text-blue-400" /> Task
                </button>
              </div>
              <button className="bg-transparent border border-[#FF7A59]/40 hover:bg-[#FF7A59]/10 text-[#FF7A59] px-6 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all">
                <Plus className="w-4 h-4" /> Create New Entry
              </button>
            </div>
          </div>
        </section>

        {/* LEFT COLUMN: Goals & Clusters */}
        <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Goal 1: Meditation */}
          <div className="bg-zinc-900/60 border border-white/5 rounded-3xl p-6">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-white">60 Day Meditation Streak</h3>
              <Target className="w-4 h-4 text-zinc-600" />
            </div>
            <p className="text-xs text-[#FF7A59] mb-4">28 days left</p>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden mb-2">
              <div className="bg-[#FF7A59] h-full w-[46%]" />
            </div>
            <p className="text-[10px] text-zinc-500 text-right uppercase tracking-wider">46% completed</p>
          </div>

          {/* Goal 2: Journal Entries */}
          <div className="bg-zinc-900/60 border border-white/5 rounded-3xl p-6">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-white">Write 30 Journal Entries</h3>
              <History className="w-4 h-4 text-zinc-600" />
            </div>
            <p className="text-xs text-orange-300 mb-4">Ends Jan 2025</p>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden mb-2">
              <div className="bg-orange-300 h-full w-[40%]" />
            </div>
            <p className="text-[10px] text-zinc-500 text-right uppercase tracking-wider">12 of 30 written</p>
          </div>

          {/* Cluster Preview Card */}
          <div className="bg-zinc-900/60 border border-white/5 rounded-3xl p-6 md:col-span-1">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-white">The Midnight Echos</h3>
              <ChevronRight className="w-4 h-4 text-zinc-600 cursor-pointer" />
            </div>
            <div className="aspect-[4/3] bg-black/40 rounded-xl border border-white/5 flex items-center justify-center p-4 relative overflow-hidden group">
               <div className="scale-75 flex flex-col items-center gap-2 opacity-60">
                 <div className="w-24 h-12 bg-zinc-800 rounded-lg border border-white/10" />
                 <div className="flex gap-2">
                   <div className="w-16 h-10 bg-zinc-800 rounded-lg border border-white/10" />
                   <div className="w-16 h-10 bg-zinc-800 rounded-lg border border-white/10" />
                 </div>
               </div>
               <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-zinc-800/80 border border-white/10 px-3 py-1.5 rounded-full scale-90">
                 <Plus className="w-3 h-3 text-[#FF7A59]" />
                 <span className="text-[10px] whitespace-nowrap">Start New Cluster</span>
               </div>
            </div>
          </div>

          {/* Tasks Card */}
          <div className="bg-zinc-900/60 border border-white/5 rounded-3xl p-6 md:col-span-1">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-white">Today's Tasks</h3>
              <ChevronRight className="w-4 h-4 text-zinc-600 cursor-pointer" />
            </div>
            <div className="space-y-3">
              {[
                { text: "Complete 'Atomic Habits'", done: false },
                { text: "Brainstorm new ideas with team", done: false },
                { text: "Finish wireframe for dashboard", done: true },
                { text: "Daily meditation session", done: false },
                { text: "Update reading log", done: false },
              ].slice(0, 5).map((task, i) => (
                <div key={i} className="flex items-center gap-3 group">
                  {task.done ? (
                    <CheckCircle2 className="w-4 h-4 text-[#FF7A59]" />
                  ) : (
                    <Circle className="w-4 h-4 text-zinc-700 group-hover:text-zinc-500" />
                  )}
                  <span className={`text-xs ${task.done ? 'text-zinc-500 line-through' : 'text-zinc-300'}`}>
                    {task.text}
                  </span>
                  <span className="ml-auto text-[9px] text-zinc-600 uppercase">Today</span>
                </div>
              ))}
            </div>
            <button className="mt-6 text-[10px] font-bold text-[#FF7A59] hover:underline uppercase tracking-widest">
              View All Tasks
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Recent Entries & Activity */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          
          {/* Recent Entries Text Box */}
          <div className="bg-zinc-900/60 border border-white/5 rounded-3xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-medium text-white">Recent Entries</h3>
              <ChevronRight className="w-4 h-4 text-zinc-600 cursor-pointer" />
            </div>
            <blockquote className="text-zinc-400 text-sm italic leading-relaxed font-light mb-6">
              "In the stillness of the morning, clarity arrives without effort. Today reminded me of that. Peace has a strange way of organizing your thoughts..."
            </blockquote>
            <p className="text-xs font-bold text-[#FF7A59]">Today</p>
          </div>

          {/* Activity Bar Chart */}
          <div className="bg-zinc-900/60 border border-white/5 rounded-3xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-medium text-white">Recent Activity</h3>
              <div className="flex items-center gap-1 text-[10px] text-zinc-500 bg-zinc-800/50 px-2 py-1 rounded-md">
                Yesterday <ChevronRight className="w-3 h-3" />
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="text-lg font-medium text-white">Sunday</h4>
            </div>

            <div className="flex justify-between items-end h-32 gap-2 mb-4">
              {[
                { day: 'Sun', h: '60%', active: false },
                { day: 'Mon', h: '50%', active: false },
                { day: 'Tue', h: '80%', active: true },
                { day: 'Wed', h: '65%', active: false },
                { day: 'Thu', h: '95%', active: true },
                { day: 'Fri', h: '70%', active: false },
                { day: 'Sat', h: '90%', active: true },
              ].map((bar, i) => (
                <div key={i} className="flex flex-col items-center flex-1 gap-2">
                  <div 
                    className={`w-full rounded-full transition-all duration-500 ${bar.active ? 'bg-[#FF7A59]' : 'bg-zinc-700/50'}`}
                    style={{ height: bar.h }}
                  />
                  <span className="text-[9px] text-zinc-600 uppercase tracking-tighter">{bar.day}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-center">
              <button className="bg-[#FF7A59]/10 text-[#FF7A59] border border-[#FF7A59]/20 px-3 py-1.5 rounded-full text-[10px] font-bold flex items-center gap-1.5">
                <TrendingUp className="w-3 h-3" />
                5 entries this week
              </button>
            </div>
          </div>
        </div>

        {/* BOTTOM SUMMARY CARD */}
        <div className="col-span-12">
          <div className="bg-gradient-to-r from-zinc-900/60 to-orange-950/20 border border-white/5 rounded-[40px] p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
            <div className="w-16 h-16 rounded-full bg-orange-900/30 flex items-center justify-center border border-orange-500/30">
               <Sparkles className="w-8 h-8 text-[#FF7A59]" />
            </div>
            <div className="text-center md:text-left flex-1 relative z-10">
              <div className="text-lg text-zinc-300 font-light leading-relaxed">
                You reflected <span className="text-[#FF7A59] font-medium">5 times</span> this week. <br />
                Most common theme: <span className="text-orange-200 font-medium italic">Career Growth</span>
              </div>
              <p className="text-sm text-zinc-500 mt-2">
                Your thoughts on "skill development" have grown by 20% since last month.
              </p>
            </div>
          </div>
        </div>

      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <button className="w-14 h-14 bg-[#FF7A59] rounded-2xl flex items-center justify-center shadow-lg shadow-[#FF7A59]/20 hover:scale-105 transition-transform active:scale-95">
          <Plus className="w-8 h-8 text-white" />
        </button>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        body {
          font-family: 'Inter', sans-serif;
          background-color: #0D0D0D;
        }
      `}</style>
    </div>
  );
};

export default DashboardPage;