'use client';

import { motion, AnimatePresence } from 'framer-motion';

export type MascotEmotion = 'neutral' | 'happy' | 'bored' | 'sleepy' | 'curious' | 'surprised' | 'thinking';

interface OrbiMascotBaseProps {
  emotion: MascotEmotion;
  isHovered?: boolean;
  pupilX: any; // MotionValue
  pupilY: any; // MotionValue
  blink: boolean;
  message?: string;
}

export function OrbiMascotBase({ emotion, isHovered, pupilX, pupilY, blink, message }: OrbiMascotBaseProps) {
  // Eye shapes based on emotion and blink
  const getEyePath = () => {
    if (blink) return "M4,8 Q10,8 16,8"; // Closed line
    if (emotion === 'sleepy') return "M4,8 Q10,10 16,8"; // Half closed
    if (emotion === 'happy') return "M4,10 Q10,2 16,10"; // Happy arc
    if (emotion === 'thinking') return "M4,6 Q10,4 16,6"; // Thinking/skeptical
    return null; // Default circle
  };

  const eyePath = getEyePath();

  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      {/* Dynamic Aura - More "Soouls" Style (Glassmorphic & Deep) */}
      <motion.div
        className="absolute w-40 h-40 rounded-full z-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(147,197,253,0) 70%)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Message Bubble - Elegant Soouls Style */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: -70, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            className="absolute z-[20] px-4 py-2 rounded-2xl border border-white/10 backdrop-blur-md bg-black/40 shadow-xl min-w-[120px] text-center"
          >
            <p className="text-white/90 text-xs font-medium tracking-wide font-urbanist">{message}</p>
            {/* Pointer */}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-black/40 backdrop-blur-md border-r border-b border-white/10 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Body - Deep Glassmorphic Sphere */}
      <motion.div
        className="relative w-24 h-24 rounded-full z-10 overflow-hidden border border-white/20 shadow-[0_0_60px_rgba(59,130,246,0.2)]"
        style={{
          background: 'radial-gradient(circle at 35% 35%, rgba(96, 165, 250, 0.9) 0%, rgba(37, 99, 235, 0.8) 40%, rgba(30, 58, 138, 0.9) 80%, rgba(15, 23, 42, 1) 100%)',
          backdropFilter: 'blur(4px)'
        }}
        animate={{
          y: [0, -12, 0], // Floating
          scale: emotion === 'surprised' ? [1, 1.15, 1] : [1, 1.03, 1], // Breathing effect
          rotate: isHovered ? [0, -3, 3, 0] : 0
        }}
        transition={{
          y: { duration: emotion === 'sleepy' ? 6 : 4, repeat: Infinity, ease: "easeInOut" },
          scale: { duration: 5, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 0.8, repeat: Infinity }
        }}
      >
        {/* Living Surface - Subtle pulsing spots (Removed ring, kept cool surface) */}
        <div className="absolute inset-0 opacity-80">
           <motion.div 
            className="absolute top-[18%] left-[22%] w-6 h-6 rounded-full bg-orange-400/80 blur-[0.5px] border border-orange-500/30 shadow-[0_0_15px_rgba(251,146,60,0.4)]" 
            animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.1, 1] }} 
            transition={{ duration: 5, repeat: Infinity }}
           />
           <motion.div 
            className="absolute top-[52%] left-[75%] w-5 h-5 rounded-full bg-cyan-400/70 blur-[0.5px] shadow-[0_0_10px_rgba(34,211,238,0.3)]"
            animate={{ opacity: [0.5, 0.9, 0.5] }} 
            transition={{ duration: 3, repeat: Infinity, delay: 1 }}
           />
           <div className="absolute top-[10%] left-[58%] w-4 h-4 rounded-full bg-yellow-300/80 blur-[0.5px]" />
           <div className="absolute top-[68%] left-[18%] w-7 h-7 rounded-full bg-blue-900/60 blur-[1px] border border-white/5" />
           <div className="absolute top-[42%] left-[82%] w-3 h-3 rounded-full bg-rose-400/60 blur-[0.5px]" />
           <div className="absolute top-[32%] left-[48%] w-2.5 h-2.5 rounded-full bg-emerald-400/50" />
           <div className="absolute top-[82%] left-[58%] w-4 h-4 rounded-full bg-indigo-400/40" />
        </div>

        {/* Glossy Refraction */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/20 pointer-events-none" />

        {/* Face Container */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pt-3">
          {/* Eyes - High Definition & "Soouls" Glow */}
          <div className="flex gap-6">
            {[0, 1].map((i) => (
              <div key={i} className="relative w-7 h-8 bg-transparent flex items-center justify-center">
                {eyePath ? (
                  <svg width="28" height="24" viewBox="0 0 28 24" className="drop-shadow-lg">
                    <motion.path
                      d={eyePath}
                      fill="none"
                      stroke="white"
                      strokeWidth="5"
                      strokeLinecap="round"
                    />
                  </svg>
                ) : (
                  <motion.div
                    className="w-6 h-7 bg-white rounded-full relative overflow-hidden shadow-[inset_0_2px_6px_rgba(0,0,0,0.3),0_0_10px_rgba(255,255,255,0.2)]"
                    animate={{ 
                      scaleY: blink ? 0.05 : (emotion === 'curious' ? 1.15 : 1),
                      scaleX: emotion === 'surprised' ? 1.2 : 1
                    }}
                  >
                    {/* Pupil */}
                    <motion.div
                      className="absolute w-4 h-4.5 bg-[#051125] rounded-full"
                      style={{
                        x: pupilX,
                        y: pupilY,
                        left: '20%',
                        top: '15%'
                      }}
                    >
                      {/* Highlights */}
                      <motion.div 
                        className="absolute top-0.5 left-0.5 w-1.5 h-1.5 bg-white rounded-full opacity-95"
                        animate={{ opacity: [0.8, 1, 0.8], scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </motion.div>
                  </motion.div>
                )}
              </div>
            ))}
          </div>

          {/* Mouth */}
          <div className="h-6 flex items-center justify-center">
             <motion.svg width="34" height="18" viewBox="0 0 34 18" className="drop-shadow-md">
                <motion.path
                  fill="none"
                  stroke="white"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  animate={{
                    d: emotion === 'happy' ? "M4,4 Q17,18 30,4" :
                       emotion === 'surprised' ? "M12,4 A5,5 0 1,0 22,4" :
                       emotion === 'curious' ? "M12,9 L22,9" :
                       emotion === 'thinking' ? "M11,10 Q17,6 23,10" :
                       emotion === 'bored' ? "M10,10 Q17,8 24,10" :
                       "M8,8 Q17,11 26,8"
                  }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                />
             </motion.svg>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
