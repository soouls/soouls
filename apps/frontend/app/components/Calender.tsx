import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Modern Calendar Component
 * Updated to remove the comment overlay and include a dynamic profile image.
 * The background text 'Soulcanvas' is now positioned to match the Figma layers.
 */

const CalendarApp = () => {
  const [view, setView] = useState('Monthly');
  const [profileImg, setProfileImg] = useState('');

  // Fetch a dynamic profile image on mount
  useEffect(() => {
    const randomId = Math.floor(Math.random() * 100);
    setProfileImg(`https://i.pravatar.cc/150?u=${randomId}`);
  }, []);

  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  
  // Generating a 28-day grid for February 2026
  const days = Array.from({ length: 28 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white font-sans p-8 flex flex-col items-center justify-center overflow-hidden selection:bg-[#e67e65]/30 relative">
      
      {/* Background Decorative Text (Soulcanvas) */}
      <div className="absolute top-[15%] left-0 w-full flex justify-center pointer-events-none select-none z-0">
        <h1 
          className="text-[16vw] font-bold leading-none tracking-tighter text-transparent opacity-30"
          style={{ 
            WebkitTextStroke: '1.5px rgba(255,255,255,0.4)',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}
        >
          Soulcanvas
        </h1>
      </div>

      {/* Header Navigation */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-12 relative z-10 px-4">
        <div className="flex items-baseline gap-1 text-2xl font-semibold tracking-tight">
          <span className="text-gray-500">Home</span>
          <span className="text-gray-400 mx-1">/</span>
          <span className="text-[#e67e65]">Calendar</span>
        </div>
        
        {/* Dynamic Profile Image */}
        <div className="w-12 h-12 rounded-full border-2 border-yellow-500 p-[2px] overflow-hidden bg-gray-800 flex items-center justify-center shadow-lg transition-transform hover:scale-110">
          <div className="w-full h-full rounded-full overflow-hidden bg-zinc-700">
            {profileImg ? (
              <img 
                src={profileImg} 
                alt="User profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full animate-pulse bg-zinc-600" />
            )}
          </div>
        </div>
      </div>

      {/* Main Calendar Card */}
      <div className="w-full max-w-4xl bg-[#121212]/90 backdrop-blur-2xl border border-white/10 rounded-[40px] p-10 relative z-10 shadow-2xl">
        
        {/* Calendar Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div className="flex items-center gap-10">
            <button className="text-gray-500 hover:text-white transition-colors">
              <ChevronLeft size={28} strokeWidth={1.5} />
            </button>
            <h2 className="text-3xl font-bold tracking-tight">
              February 2026
            </h2>
            <button className="text-gray-500 hover:text-white transition-colors">
              <ChevronRight size={28} strokeWidth={1.5} />
            </button>
          </div>

          {/* View Toggler */}
          <div className="bg-black/60 p-1 rounded-full border border-white/5 flex items-center">
            {['Monthly', 'Weekly', 'Daily'].map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-8 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                  view === v 
                  ? 'bg-[#e67e65] text-white shadow-xl' 
                  : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 mb-10">
          {daysOfWeek.map(day => (
            <div key={day} className="flex justify-center">
              <span className="text-[10px] font-black text-gray-400 tracking-[0.25em] bg-white/5 px-5 py-2.5 rounded-2xl uppercase">
                {day}
              </span>
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-y-10">
          {days.map(day => {
            const isSelected = day === 7;
            return (
              <div key={day} className="relative flex justify-center items-center group">
                <div 
                  className={`
                    w-14 h-16 flex items-center justify-center text-2xl font-light cursor-pointer transition-all duration-300 rounded-2xl
                    ${isSelected 
                      ? 'bg-[#e67e65] text-white shadow-2xl shadow-[#e67e65]/40 scale-105' 
                      : 'text-gray-300 hover:bg-white/5 hover:scale-110'
                    }
                  `}
                >
                  {day}
                </div>
                
                {/* Subtle Grid Dividers */}
                {day % 7 !== 0 && (
                   <div className="absolute right-0 h-12 w-[1px] bg-white/5 top-1/2 -translate-y-1/2" />
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Search Bar Trigger */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
          <button className="bg-[#1a1a1a] border border-white/10 px-8 py-3 rounded-full text-xs text-gray-500 font-bold flex items-center gap-2 hover:border-[#e67e65]/50 hover:text-gray-300 transition-all shadow-2xl group uppercase tracking-widest">
            <span className="opacity-60 group-hover:opacity-100 transition-opacity">Ctrl + k to search</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarApp;