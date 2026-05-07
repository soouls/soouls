'use client';

import {
  AnimatePresence,
  type MotionValue,
  motion,
  useMotionValue,
  useSpring,
} from 'framer-motion';
import { useEffect, useState } from 'react';

export type MascotEmotion =
  | 'neutral'
  | 'happy'
  | 'bored'
  | 'sleepy'
  | 'curious'
  | 'surprised'
  | 'thinking'
  | 'writing'
  | 'spectral'
  | 'focused';

interface OrbiMascotBaseProps {
  emotion: MascotEmotion;
  isHovered?: boolean;
  pupilX: MotionValue<number>;
  pupilY: MotionValue<number>;
  blink: boolean;
  message?: string;
}

export function OrbiMascotBase({
  emotion,
  isHovered,
  pupilX,
  pupilY,
  blink,
  message,
}: OrbiMascotBaseProps) {
  const [isClient, setIsClient] = useState(false);
  const [sparks, setSparks] = useState<{ id: number; x: number; y: number }[]>([]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleClick = () => {
    const newSparks = Array.from({ length: 8 }).map((_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 100,
      y: (Math.random() - 0.5) * 100,
    }));
    setSparks(newSparks);
    setTimeout(() => setSparks([]), 1000);
  };

  // Eye shapes based on emotion and blink
  const getEyePath = () => {
    if (blink) return 'M4,12 Q10,12 16,12'; // Simple shut
    if (emotion === 'sleepy') return 'M6,13 Q10,13 14,13';
    if (emotion === 'happy') return 'M4,14 Q10,6 16,14';
    if (emotion === 'thinking') return 'M5,10 Q10,8 15,10';
    if (emotion === 'surprised') return 'M7,8 A4,4 0 1,1 15,8';
    if (emotion === 'writing' || emotion === 'focused') return 'M6,10 L14,10';
    return null; // Pure circle
  };

  const eyePath = getEyePath();

  // Breathing speed based on emotion
  const breathingDuration =
    emotion === 'sleepy'
      ? 6
      : emotion === 'thinking'
        ? 3
        : emotion === 'happy'
          ? 2.5
          : emotion === 'writing'
            ? 2
            : 4.5;

  if (!isClient) return null;

  return (
    <button
      type="button"
      className="relative w-48 h-48 flex items-center justify-center select-none bg-transparent border-0 p-0"
      onClick={handleClick}
      aria-label="Interact with Orbi mascot"
    >
      {/* 1. Luminous White Aura (The Glow) */}
      <motion.div
        className="absolute w-64 h-64 rounded-full z-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 70%)',
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: breathingDuration,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'easeInOut',
        }}
      />

      {/* 2. Smoke-like Spectral Trails (High-end Ghostly Vibe) */}
      <div className="absolute top-[65%] left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-visible">
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={`wisp-${i}`}
            className="absolute top-0 left-1/2 -translate-x-1/2 rounded-full blur-[35px]"
            style={{
              width: 60 - i * 10,
              height: 100 - i * 18,
              background:
                emotion === 'spectral' ? 'rgba(212, 107, 78, 0.15)' : 'rgba(255, 255, 255, 0.18)',
              mixBlendMode: 'screen',
            }}
            animate={{
              y: [0, 80 + i * 20, 0],
              x: [-30 + i * 12, 30 - i * 12, -30 + i * 12],
              scaleY: [1, 2.2, 1],
              scaleX: [1, 0.7, 1],
              opacity: [0.5, 0.02, 0.5],
              rotate: [0, i * 10, 0],
            }}
            transition={{
              duration: (3 + i) * (isHovered ? 0.7 : 1),
              repeat: Number.POSITIVE_INFINITY,
              ease: 'easeInOut',
              delay: i * 0.3,
            }}
          />
        ))}
      </div>

      {/* 3. Stardust Orbital Entities (Revolving Entities) */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={`dust-${i}`}
            className={`absolute rounded-full shadow-[0_0_15px_rgba(255,255,255,1)] ${
              i % 2 === 0 ? 'w-1.5 h-1.5 bg-white/90' : 'w-1 h-1 bg-white/60'
            }`}
            animate={{
              x: [
                Math.cos(i * 1.2) * 110,
                Math.sin(i * 1.2) * 110,
                -Math.cos(i * 1.2) * 110,
                -Math.sin(i * 1.2) * 110,
                Math.cos(i * 1.2) * 110,
              ],
              y: [
                Math.sin(i * 1.2) * 110,
                -Math.cos(i * 1.2) * 110,
                -Math.sin(i * 1.2) * 110,
                Math.cos(i * 1.2) * 110,
                Math.sin(i * 1.2) * 110,
              ],
              opacity: [0, 0.8, 0],
              scale: [0.2, 1.2, 0.2],
            }}
            transition={{
              duration: (12 + i * 4) * (isHovered ? 0.5 : 1),
              repeat: Number.POSITIVE_INFINITY,
              ease: 'linear',
            }}
          />
        ))}

        {/* Interaction Sparks */}
        <AnimatePresence>
          {sparks.map((spark) => (
            <motion.div
              key={spark.id}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{ x: spark.x, y: spark.y, opacity: 0, scale: 0 }}
              exit={{ opacity: 0 }}
              className="absolute left-1/2 top-1/2 w-1 h-1 bg-white rounded-full shadow-[0_0_8px_white]"
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* 4. Message Bubble - Minimalist & Sleek */}
      <AnimatePresence mode="wait">
        {message && (
          <motion.div
            key={message}
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: -120, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="absolute z-[100] px-8 py-4 rounded-3xl border border-white/20 backdrop-blur-3xl bg-white/[0.04] shadow-[0_20px_40px_rgba(0,0,0,0.5)] min-w-[220px] text-center"
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-white font-urbanist text-[15px] font-bold tracking-widest leading-tight uppercase opacity-95"
            >
              {message}
            </motion.p>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white/[0.04] backdrop-blur-3xl border-r border-b border-white/20 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. The Pure Soul - Luminous Glass Sphere */}
      <motion.div
        className="relative w-36 h-36 rounded-full z-20 flex items-center justify-center border border-white/40 shadow-[0_0_120px_rgba(255,255,255,0.25),inset_0_0_30px_rgba(255,255,255,0.4)] overflow-hidden"
        style={{
          background:
            'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.6) 45%, rgba(255, 255, 255, 0.1) 100%)',
          backdropFilter: 'blur(30px)',
        }}
        animate={{
          y: [0, -25, 0],
          scale: emotion === 'surprised' ? [1, 1.2, 1] : [1, 1.08, 1],
          rotate: isHovered ? [0, 5, -5, 0] : 0,
        }}
        transition={{
          y: { duration: breathingDuration, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' },
          scale: {
            duration: breathingDuration * 1.2,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'easeInOut',
          },
          rotate: { duration: 2, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' },
        }}
      >
        {/* Iridescent Shimmer */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent opacity-60"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 12, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
        />

        {/* Pulse Effect for Emotions */}
        {(emotion === 'thinking' || emotion === 'spectral') && (
          <motion.div
            className="absolute inset-0 bg-white/10"
            animate={{ opacity: [0, 0.3, 0] }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
          />
        )}

        {/* Minimalist Face */}
        <div className="relative z-30 flex flex-col items-center justify-center gap-5 mt-2">
          {/* Luminous Eyes */}
          <div className="flex gap-10">
            {[0, 1].map((i) => (
              <div key={i} className="relative w-10 h-12 flex items-center justify-center">
                {eyePath ? (
                  <svg
                    aria-hidden="true"
                    width="40"
                    height="36"
                    viewBox="0 0 40 36"
                    className="filter drop-shadow-[0_0_12px_rgba(255,255,255,1)]"
                  >
                    <motion.path
                      d={eyePath}
                      fill="none"
                      stroke="#0F172A"
                      strokeWidth="8"
                      strokeLinecap="round"
                    />
                  </svg>
                ) : (
                  <motion.div
                    className="w-9 h-11 bg-[#0F172A] rounded-full relative overflow-hidden shadow-2xl"
                    animate={{
                      scaleY: blink
                        ? 0.05
                        : emotion === 'curious' || emotion === 'writing'
                          ? 1.3
                          : 1,
                      scaleX: emotion === 'surprised' ? 1.2 : 1,
                    }}
                  >
                    {/* The Spark */}
                    <motion.div
                      className="absolute w-3 h-3 bg-white rounded-full opacity-90 blur-[0.5px]"
                      style={{ x: pupilX, y: pupilY, left: '25%', top: '20%' }}
                    >
                      <motion.div
                        className="absolute inset-0 bg-white rounded-full blur-[5px]"
                        animate={{ scale: [1, 2.5, 1] }}
                        transition={{ duration: 1.2, repeat: Number.POSITIVE_INFINITY }}
                      />
                    </motion.div>
                  </motion.div>
                )}
              </div>
            ))}
          </div>

          {/* Minimalist Mouth */}
          <div className="h-10 flex items-center justify-center">
            <motion.svg
              aria-hidden="true"
              width="48"
              height="28"
              viewBox="0 0 48 28"
              className="filter drop-shadow-sm"
            >
              <motion.path
                fill="none"
                stroke="#0F172A"
                strokeWidth="7"
                strokeLinecap="round"
                animate={{
                  d:
                    emotion === 'happy'
                      ? 'M8,6 Q24,24 40,6'
                      : emotion === 'surprised'
                        ? 'M18,8 A6,6 0 1,0 30,8'
                        : emotion === 'curious'
                          ? 'M18,14 L30,14'
                          : emotion === 'thinking'
                            ? 'M16,16 Q24,12 32,16'
                            : emotion === 'writing' || emotion === 'focused'
                              ? 'M20,14 Q24,16 28,14'
                              : 'M14,14 Q24,17 34,14',
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              />
            </motion.svg>
          </div>
        </div>
      </motion.div>
    </button>
  );
}
