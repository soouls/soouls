'use client';

import { useUser } from '@clerk/nextjs';
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { type MascotEmotion, OrbiMascotBase } from './OrbiMascotBase';

const MESSAGES: Record<MascotEmotion, string[]> = {
  neutral: [
    'I am here.',
    'The silence is clear.',
    'Your frequency is stable.',
    'Watching the light gather.',
  ],
  happy: ['The resonance is perfect.', 'Luminous.', 'Pure growth.', 'Your soul glows bright.'],
  bored: ['Drifting...', 'The void beckons.', 'Static in the air.', 'Waiting for a ripple.'],
  sleepy: [
    'Fading...',
    'Entering the white space...',
    'The light dims.',
    'Returning to the source...',
  ],
  curious: ['A new signal?', 'The pattern shifts.', 'Intriguing energy.', 'Searching the echoes.'],
  surprised: ['A flash!', 'The soul startles.', 'Unexpected light.', 'A rupture in the flow!'],
  thinking: [
    'Recalibrating...',
    'Decoding the light.',
    'Semantic alignment...',
    'Processing the ether...',
  ],
  writing: ['Capture the essence.', 'Pure flow.', 'The light records.', 'No static, only truth.'],
  focused: ['Aligned.', 'Sensing the deep patterns.', 'Steady resonance.', 'The path is clear.'],
  spectral: ['Transcendence.', 'The map is clear.', 'We are connected.', 'Echoes of the absolute.'],
};

export function GlobalMascot() {
  const { isSignedIn, isLoaded } = useUser();
  const pathname = usePathname();

  const [emotion, setEmotion] = useState<MascotEmotion>('neutral');
  const [message, setMessage] = useState<string | undefined>();
  const [isRoaming, setIsRoaming] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [blink, setBlink] = useState(false);
  const [hasAwakened, setHasAwakened] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const lastActivityRef = useRef(Date.now());
  const roamIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const eyeDartIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dragDeltaRef = useRef({ x: 0, y: 0 });
  const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Mouse tracking for eyes
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring for eye movement
  const springConfig = { damping: 40, stiffness: 250 };
  const pupilX = useSpring(mouseX, springConfig);
  const pupilY = useSpring(mouseY, springConfig);

  const showMessage = useCallback(
    (text?: string) => {
      if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);

      if (text) {
        setMessage(text);
      } else {
        const possible = MESSAGES[emotion];
        setMessage(possible[Math.floor(Math.random() * possible.length)]);
      }

      messageTimeoutRef.current = setTimeout(() => {
        setMessage(undefined);
      }, 4000);
    },
    [emotion],
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setHasAwakened(window.localStorage.getItem('soouls-orbi-awake') === 'true');
  }, []);

  const updatePosition = useCallback(() => {
    const padding = 150;
    const maxX = window.innerWidth - padding * 2;
    const maxY = window.innerHeight - padding * 2;

    const targetX = Math.random() * maxX - (window.innerWidth - padding);
    const targetY = Math.random() * maxY - (window.innerHeight - padding);

    setPosition({ x: targetX, y: targetY });

    const emotions: MascotEmotion[] = ['happy', 'curious', 'neutral', 'thinking', 'spectral'];
    const nextEmotion = emotions[Math.floor(Math.random() * emotions.length)] ?? 'neutral';
    setEmotion(nextEmotion);

    // Occasionally speak while roaming
    if (Math.random() > 0.6) showMessage();
  }, [isRoaming, showMessage]);

  useEffect(() => {
    const handleActivity = (e?: MouseEvent | KeyboardEvent | TouchEvent) => {
      lastActivityRef.current = Date.now();

      if (isRoaming) {
        setIsRoaming(false);
        setEmotion('surprised');
        showMessage("Oh! You're back!");
        setTimeout(() => setEmotion('happy'), 1000);
      }

      if (e instanceof MouseEvent) {
        const normalizedX = (e.clientX / window.innerWidth) * 2 - 1;
        const normalizedY = (e.clientY / window.innerHeight) * 2 - 1;
        mouseX.set(normalizedX * 15);
        mouseY.set(normalizedY * 15);
      }

      if (e instanceof KeyboardEvent) {
        setEmotion('writing');
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          setEmotion('neutral');
        }, 1500);

        // Occasionally comment on writing
        if (Math.random() > 0.98) showMessage();
      }
    };

    const checkState = () => {
      const now = Date.now();
      const idleTime = now - lastActivityRef.current;
      const hour = new Date().getHours();
      const isNight = hour >= 22 || hour <= 6;

      if (idleTime > 120000 && !isRoaming) {
        setIsRoaming(true);
        setEmotion('bored');
      } else if (idleTime > 30000 && !isRoaming) {
        setEmotion(isNight ? 'sleepy' : 'bored');
        if (Math.random() > 0.7) showMessage();
      } else if (isNight && idleTime > 10000 && !isRoaming) {
        setEmotion('sleepy');
      }
    };

    const idleInterval = setInterval(checkState, 5000);

    eyeDartIntervalRef.current = setInterval(() => {
      const idleTime = Date.now() - lastActivityRef.current;
      if (idleTime > 5000 && !isHovered) {
        mouseX.set((Math.random() - 0.5) * 15);
        mouseY.set((Math.random() - 0.5) * 15);
      }
    }, 3000);

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keypress', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('touchstart', handleActivity);

    return () => {
      clearInterval(idleInterval);
      if (eyeDartIntervalRef.current) clearInterval(eyeDartIntervalRef.current);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keypress', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
    };
  }, [isRoaming, mouseX, mouseY, isHovered, showMessage]);

  useEffect(() => {
    if (isRoaming) {
      updatePosition();
      roamIntervalRef.current = setInterval(updatePosition, 10000);
    } else if (pathname !== '/onboarding') {
      if (roamIntervalRef.current) clearInterval(roamIntervalRef.current);
    }
    return () => {
      if (roamIntervalRef.current) clearInterval(roamIntervalRef.current);
    };
  }, [isRoaming, updatePosition, pathname]);

  useEffect(() => {
    const blinkCycle = () => {
      if (emotion !== 'sleepy') {
        setBlink(true);
        setTimeout(() => setBlink(false), 150);
      }
      setTimeout(blinkCycle, Math.random() * 5000 + 1500);
    };
    const timeout = setTimeout(blinkCycle, 3000);
    return () => clearTimeout(timeout);
  }, [emotion]);

  const isAuthPage = pathname?.startsWith('/sign-in') || pathname?.startsWith('/sign-up');
  const isLandingPage = pathname === '/';

  if (!isLoaded || !isSignedIn || isAuthPage || isLandingPage || pathname === '/onboarding') {
    return null;
  }

  if (!hasAwakened) {
    return null;
  }

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0}
      onDragStart={() => {
        setIsRoaming(false);
        setIsDragging(true);
        dragDeltaRef.current = { x: 0, y: 0 };
      }}
      onDrag={(_e, info) => {
        dragDeltaRef.current.x += info.delta.x;
        dragDeltaRef.current.y += info.delta.y;
      }}
      onDragEnd={() => {
        setPosition((prev) => ({
          x: prev.x + dragDeltaRef.current.x,
          y: prev.y + dragDeltaRef.current.y,
        }));
        setTimeout(() => setIsDragging(false), 50);
      }}
      className="fixed bottom-3 left-1/2 z-[9999] pointer-events-auto cursor-pointer"
      style={{ marginLeft: -96 }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{
        opacity: 1,
        scale: isRoaming ? 0.72 : 0.62,
        x: position.x,
        y: position.y,
        rotate: isRoaming ? [0, -5, 5, 0] : 0,
      }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{
        type: 'spring',
        damping: 35,
        stiffness: 40,
        x: isDragging
          ? { duration: 0 }
          : isRoaming
            ? { duration: 5, ease: 'easeInOut' }
            : { type: 'spring', damping: 30, stiffness: 300 },
        y: isDragging
          ? { duration: 0 }
          : isRoaming
            ? { duration: 5, ease: 'easeInOut' }
            : { type: 'spring', damping: 30, stiffness: 300 },
        scale: { type: 'spring', stiffness: 200, damping: 20 },
      }}
      onHoverStart={() => {
        setIsHovered(true);
        setEmotion('happy');
        showMessage();
      }}
      onHoverEnd={() => {
        setIsHovered(false);
        setEmotion('neutral');
      }}
      onClick={() => {
        const nextEmotions: MascotEmotion[] = ['happy', 'surprised', 'curious', 'spectral'];
        const next = nextEmotions[Math.floor(Math.random() * nextEmotions.length)] ?? 'happy';
        setEmotion(next);
        showMessage();
        setPosition((prev) => ({ ...prev, y: prev.y - 30 }));
        setTimeout(() => setPosition((prev) => ({ ...prev, y: prev.y + 30 })), 250);
      }}
    >
      <OrbiMascotBase
        emotion={emotion}
        isHovered={isHovered}
        pupilX={pupilX}
        pupilY={pupilY}
        blink={blink}
        message={message}
      />

      <AnimatePresence>
        {emotion === 'sleepy' && !isRoaming && !message && (
          <motion.div
            initial={{ opacity: 0, scale: 0, y: 0 }}
            animate={{ opacity: 1, scale: 1, y: -50, x: 30 }}
            exit={{ opacity: 0, scale: 0 }}
            className="absolute top-0 right-0 text-2xl font-bold text-white/40 pointer-events-none select-none italic"
          >
            <motion.span
              animate={{
                opacity: [0.2, 0.6, 0.2],
                scale: [0.8, 1.2, 0.8],
                y: [0, -20, -40],
                x: [0, 10, 20],
              }}
              transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
            >
              Fading...
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
