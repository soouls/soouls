'use client';

import { useUser } from '@clerk/nextjs';
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { type MascotEmotion, OrbiMascotBase } from './OrbiMascotBase';

const MESSAGES: Partial<Record<MascotEmotion, string[]>> = {
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
  excited: ['I am awake.', 'Signal rising.', 'Let us go.', 'The room is lit.'],
  playful: ['Tap accepted.', 'Tiny orbit.', 'I can move.', 'Try dragging me.'],
  celebrating: ['First spark saved.', 'That counted.', 'A beginning.', 'We started.'],
  listening: ['I hear the shape of it.', 'Still here.', 'Go on.', 'Holding the thread.'],
  idea: ['There it is.', 'A little light.', 'Catch that.', 'That thought has edges.'],
  working: [
    'Building the map.',
    'Following the current.',
    'Threading it together.',
    'Still with you.',
  ],
  floating: ['Drifting nearby.', 'Soft orbit.', 'No rush.', 'I will hover here.'],
  waving: ['Hello again.', 'Found you.', 'Back in range.', 'Here.'],
};

export function GlobalMascot() {
  const { isSignedIn, isLoaded } = useUser();
  const pathname = usePathname();

  const [emotion, setEmotion] = useState<MascotEmotion>('neutral');
  const [message, setMessage] = useState<string | undefined>();
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [blink, setBlink] = useState(false);
  const [hasAwakened, setHasAwakened] = useState(false);
  const [awakenedDuringOnboarding, setAwakenedDuringOnboarding] = useState(false);
  const [arrivalPulse, setArrivalPulse] = useState(false);

  const eyeDartIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
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
        const possible = MESSAGES[emotion] ?? MESSAGES.neutral ?? ['I am here.'];
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
    const syncAwake = (event?: Event) => {
      const awakened = window.localStorage.getItem('soouls-orbi-awake') === 'true';
      setHasAwakened(awakened);
      if (event?.type === 'soouls-orbi-awake') {
        setAwakenedDuringOnboarding(true);
      }
      if (awakened) {
        setArrivalPulse(true);
        setEmotion('waving');
        if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
        setMessage('I am awake.');
        messageTimeoutRef.current = setTimeout(() => {
          setMessage(undefined);
        }, 3600);
        setTimeout(() => setArrivalPulse(false), 1800);
      }
    };

    syncAwake();
    window.addEventListener('storage', syncAwake);
    window.addEventListener('soouls-orbi-awake', syncAwake);
    return () => {
      window.removeEventListener('storage', syncAwake);
      window.removeEventListener('soouls-orbi-awake', syncAwake);
    };
  }, []);

  useEffect(() => {
    if (pathname === '/onboarding') {
      setAwakenedDuringOnboarding(false);
    }
  }, [pathname]);

  useEffect(() => {
    const handleActivity = (e?: MouseEvent | KeyboardEvent | TouchEvent) => {
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

    eyeDartIntervalRef.current = setInterval(() => {
      if (!isHovered) {
        mouseX.set((Math.random() - 0.5) * 15);
        mouseY.set((Math.random() - 0.5) * 15);
      }
    }, 3000);

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keypress', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('touchstart', handleActivity);

    return () => {
      if (eyeDartIntervalRef.current) clearInterval(eyeDartIntervalRef.current);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keypress', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
    };
  }, [mouseX, mouseY, isHovered, showMessage]);

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

  if (!isLoaded || !isSignedIn || isAuthPage || isLandingPage) {
    return null;
  }

  if (!hasAwakened) {
    return null;
  }

  if (pathname === '/onboarding' && !awakenedDuringOnboarding) {
    return null;
  }

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0}
      onDragEnd={(_e, info) => {
        setPosition((prev) => ({
          x: prev.x + info.offset.x,
          y: prev.y + info.offset.y,
        }));
      }}
      className="fixed bottom-5 right-5 z-[9999] pointer-events-auto cursor-grab active:cursor-grabbing"
      initial={{ opacity: 0, scale: 0.28, y: 28, filter: 'brightness(1.8)' }}
      animate={{
        opacity: 1,
        scale: arrivalPulse ? [0.42, 0.82, 0.64] : 0.6,
        x: position.x,
        y: position.y,
        rotate: arrivalPulse ? [0, -10, 8, 0] : 0,
        filter: arrivalPulse
          ? [
              'brightness(1.8) drop-shadow(0 0 38px rgba(238,122,97,.75))',
              'brightness(1.2) drop-shadow(0 0 18px rgba(238,122,97,.42))',
            ]
          : 'brightness(1)',
      }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{
        type: 'spring',
        damping: 35,
        stiffness: 40,
        x: { type: 'spring', damping: 30, stiffness: 300 },
        y: { type: 'spring', damping: 30, stiffness: 300 },
        scale: { type: 'spring', stiffness: 220, damping: 18 },
      }}
      onHoverStart={() => {
        setIsHovered(true);
        setEmotion('playful');
        showMessage();
      }}
      onHoverEnd={() => {
        setIsHovered(false);
        setEmotion('neutral');
      }}
      onClick={() => {
        const nextEmotions: MascotEmotion[] = [
          'happy',
          'surprised',
          'curious',
          'spectral',
          'celebrating',
          'idea',
          'waving',
        ];
        const next = nextEmotions[Math.floor(Math.random() * nextEmotions.length)] ?? 'happy';
        setEmotion(next);
        showMessage();
        setPosition((prev) => ({ ...prev, y: prev.y - 30 }));
        setTimeout(() => setPosition((prev) => ({ ...prev, y: prev.y + 30 })), 250);
      }}
    >
      <motion.div
        className="pointer-events-none absolute inset-8 rounded-full border border-white/10"
        animate={{
          scale: arrivalPulse ? [0.6, 1.35, 0.95] : [0.9, 1.08, 0.9],
          opacity: arrivalPulse ? [0, 0.72, 0] : [0.16, 0.34, 0.16],
        }}
        transition={{ duration: arrivalPulse ? 1.1 : 3, repeat: Number.POSITIVE_INFINITY }}
      />
      <motion.div
        className="pointer-events-none absolute left-12 top-10 h-2 w-2 rounded-full bg-[rgba(var(--soouls-bg-elevated-rgb),1)]"
        animate={{
          opacity: [0, 0.9, 0.15, 0.7, 0],
          x: [0, 12, -4, 20, 0],
          y: [0, -18, -30, -46, -58],
          scale: [0.5, 1, 0.7, 1.2, 0.2],
        }}
        transition={{ duration: 2.4, repeat: Number.POSITIVE_INFINITY, repeatDelay: 1.2 }}
      />
      <OrbiMascotBase
        emotion={emotion}
        isHovered={isHovered}
        pupilX={pupilX}
        pupilY={pupilY}
        blink={blink}
        message={message}
      />
    </motion.div>
  );
}
