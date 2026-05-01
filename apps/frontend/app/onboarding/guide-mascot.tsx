'use client';

import { motion, useMotionValue, useSpring } from 'framer-motion';
import { Star } from 'lucide-react';
import { OrbiMascotBase, MascotEmotion } from '../components/OrbiMascotBase';
import { useEffect, useState } from 'react';

type ThemeColor = 'orange' | 'yellow' | 'green' | 'purple';

type GuideMascotProps = {
  theme: ThemeColor;
  step: number;
  awake: boolean;
  isWaitlistUser: boolean;
  name?: string;
  firstEntry?: string;
  onWake?: () => void;
  centered?: boolean;
};

const themeTokens: Record<
  ThemeColor,
  {
    accent: string;
    border: string;
    bubble: string;
    glow: string;
    shadow: string;
  }
> = {
  orange: {
    accent: '#E07A5F',
    border: 'rgba(224, 122, 95, 0.36)',
    bubble: 'rgba(44, 24, 18, 0.88)',
    glow: 'rgba(224, 122, 95, 0.34)',
    shadow: 'rgba(224, 122, 95, 0.24)',
  },
  yellow: {
    accent: '#D9A23D',
    border: 'rgba(217, 162, 61, 0.34)',
    bubble: 'rgba(44, 33, 13, 0.86)',
    glow: 'rgba(217, 162, 61, 0.28)',
    shadow: 'rgba(217, 162, 61, 0.2)',
  },
  green: {
    accent: '#73B27C',
    border: 'rgba(115, 178, 124, 0.34)',
    bubble: 'rgba(19, 41, 29, 0.84)',
    glow: 'rgba(115, 178, 124, 0.28)',
    shadow: 'rgba(115, 178, 124, 0.2)',
  },
  purple: {
    accent: '#8C72D8',
    border: 'rgba(140, 114, 216, 0.34)',
    bubble: 'rgba(28, 21, 44, 0.88)',
    glow: 'rgba(140, 114, 216, 0.3)',
    shadow: 'rgba(140, 114, 216, 0.2)',
  },
};

function getMascotMood({
  step,
  awake,
  name,
  firstEntry,
}: Omit<GuideMascotProps, 'theme' | 'onWake' | 'isWaitlistUser' | 'centered'>) {
  if (!awake) return { emotion: 'sleepy' as MascotEmotion, line: "Zzz... Tap the signal to wake me." };
  
  if (step <= 5) return { emotion: 'curious' as MascotEmotion, line: "I'm tuning into your frequency. Let's build your space." };
  if (step === 8) return { emotion: 'happy' as MascotEmotion, line: name ? `Hello, ${name}! It fits you perfectly.` : "There you are! Hello! What should I call you?" };
  if (step === 10) return { emotion: 'thinking' as MascotEmotion, line: firstEntry ? "Ready to light the first ember?" : "One honest sentence can start it all." };
  
  return { emotion: 'neutral' as MascotEmotion, line: "I'm here to guide your journey." };
}

export function GuideMascot({
  theme,
  step,
  awake,
  isWaitlistUser,
  name,
  firstEntry,
  onWake,
  centered,
}: GuideMascotProps) {
  const tone = themeTokens[theme];
  const mood = getMascotMood({ step, awake, name, firstEntry });
  const [blink, setBlink] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const pupilX = useSpring(mouseX, { damping: 40, stiffness: 250 });
  const pupilY = useSpring(mouseY, { damping: 40, stiffness: 250 });

  useEffect(() => {
    if (!awake) return;
    const interval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, Math.random() * 4000 + 2000);
    return () => clearInterval(interval);
  }, [awake]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!awake) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    mouseX.set(x * 8);
    mouseY.set(y * 8);
  };

  return (
    <motion.div
      layout
      className="fixed z-50 flex items-end gap-3 pointer-events-none"
      initial={false}
      animate={centered ? {
        left: '50%',
        top: '50%',
        x: '-50%',
        y: '-50%',
        scale: 1.4,
        right: 'auto',
        bottom: 'auto'
      } : {
        right: '24px',
        bottom: '24px',
        left: 'auto',
        top: 'auto',
        x: 0,
        y: 0,
        scale: 1
      }}
      transition={{ type: 'spring', damping: 30, stiffness: 100 }}
    >
      {/* Message Bubble */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, x: 20 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        className="hidden sm:block max-w-[18rem] rounded-[26px] border p-5 backdrop-blur-2xl"
        style={{
          borderColor: tone.border,
          backgroundColor: tone.bubble,
          boxShadow: `0 24px 60px ${tone.shadow}`,
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="text-[10px] uppercase tracking-[0.2em] opacity-50 text-white">ORBI GUIDE</div>
          {isWaitlistUser && <Star className="w-3 h-3 text-orange-400" />}
        </div>
        <p className="text-sm leading-relaxed text-white/90 font-urbanist">{mood.line}</p>
      </motion.div>

      {/* Mascot Core */}
      <motion.div
        className="relative pointer-events-auto cursor-pointer"
        onClick={!awake ? onWake : undefined}
        onMouseMove={handleMouseMove}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <OrbiMascotBase
          emotion={mood.emotion}
          blink={blink}
          pupilX={pupilX}
          pupilY={pupilY}
          isHovered={false}
        />
        
        {!awake && (
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3], y: [-2, 2, -2] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute -top-8 right-0 text-xl pointer-events-none"
          >
            💤
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
