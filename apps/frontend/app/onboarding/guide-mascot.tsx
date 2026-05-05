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
  if (!awake) return { emotion: 'sleepy' as MascotEmotion, line: "The light is gathering. Tap to wake me." };
  
  if (step <= 5) return { emotion: 'curious' as MascotEmotion, line: "Tuning into your frequency... Let's align your space." };
  if (step === 8) return { emotion: 'happy' as MascotEmotion, line: name ? `Welcome, ${name}. Your energy resonance is pure.` : "There you are. A new soul in the ether. How should I call you?" };
  if (step === 10) return { emotion: 'thinking' as MascotEmotion, line: firstEntry ? "A memory captured. Shall we step into the room?" : "A single honest sentence. That's all it takes to begin." };
  if (step === 11) return { emotion: 'spectral' as MascotEmotion, line: "The space is live. I will wait for you within the light." };
  
  return { emotion: 'neutral' as MascotEmotion, line: "I am here to guide your resonance." };
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
    mouseX.set(x * 12);
    mouseY.set(y * 12);
  };

  return (
    <motion.div
      layout
      className="fixed z-[100] pointer-events-none"
      initial={false}
      animate={centered ? {
        left: '50%',
        top: '50%',
        x: '-50%',
        y: '-50%',
        scale: 1.5,
      } : {
        left: 'auto',
        top: 'auto',
        right: '40px',
        bottom: '40px',
        x: 0,
        y: 0,
        scale: 1
      }}
      transition={{ type: 'spring', damping: 35, stiffness: 80 }}
    >
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
          message={mood.line}
        />
        
        {!awake && (
          <motion.div
            animate={{ opacity: [0.2, 0.5, 0.2], y: [-5, 5, -5] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute -top-12 right-0 text-xl font-bold text-white/20 pointer-events-none select-none italic"
          >
            Fading...
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
