'use client';

import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useEffect, useState } from 'react';
import { type MascotEmotion, OrbiMascotBase } from '../components/OrbiMascotBase';

type ThemeColor = 'ember' | 'gold' | 'sage' | 'violet';

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

function getMascotMood({
  step,
  awake,
  name,
  firstEntry,
}: Omit<GuideMascotProps, 'theme' | 'onWake' | 'isWaitlistUser' | 'centered'>) {
  if (!awake)
    return { emotion: 'sleepy' as MascotEmotion, line: 'The light is gathering. Tap to wake me.' };

  if (step <= 5)
    return {
      emotion: 'curious' as MascotEmotion,
      line: "Tuning into your frequency... Let's align your space.",
    };
  if (step === 8)
    return {
      emotion: 'happy' as MascotEmotion,
      line: name
        ? `Welcome, ${name}. Your energy resonance is pure.`
        : 'There you are. A new soul in the ether. How should I call you?',
    };
  if (step === 10)
    return {
      emotion: 'thinking' as MascotEmotion,
      line: firstEntry
        ? 'A memory captured. Shall we step into the room?'
        : "A single honest sentence. That's all it takes to begin.",
    };
  if (step === 11)
    return {
      emotion: 'spectral' as MascotEmotion,
      line: 'The space is live. I will wait for you within the light.',
    };

  return { emotion: 'neutral' as MascotEmotion, line: 'I am here to guide your resonance.' };
}

export function GuideMascot({ step, awake, name, firstEntry, onWake, centered }: GuideMascotProps) {
  const mood = getMascotMood({ step, awake, name, firstEntry });
  const [blink, setBlink] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const pupilX = useSpring(mouseX, { damping: 40, stiffness: 250 });
  const pupilY = useSpring(mouseY, { damping: 40, stiffness: 250 });

  useEffect(() => {
    if (!awake) return;
    const interval = setInterval(
      () => {
        setBlink(true);
        setTimeout(() => setBlink(false), 150);
      },
      Math.random() * 4000 + 2000,
    );
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
      animate={
        centered
          ? {
              left: '50%',
              top: '64%',
              x: '-50%',
              y: '-50%',
              scale: 0.72,
            }
          : {
              left: 'auto',
              top: 'auto',
              right: '16px',
              bottom: '100px',
              x: 0,
              y: 0,
              scale: 0.42,
              opacity: 0.85,
            }
      }
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
            transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
            className="absolute -top-12 right-0 text-xl font-bold text-white/20 pointer-events-none select-none italic"
          >
            Fading...
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
