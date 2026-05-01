'use client';

import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import { OrbiMascotBase, MascotEmotion } from './OrbiMascotBase';

const MESSAGES: Record<MascotEmotion, string[]> = {
  neutral: ["I'm here for you.", "Everything looks good.", "Ready whenever you are."],
  happy: ["Great work today!", "You're doing amazing.", "I love our progress!"],
  bored: ["Need a break?", "I'm just drifting...", "Should we do something?"],
  sleepy: ["It's getting late...", "Just a quick nap...", "Zzz... Oh, hi!"],
  curious: ["What's on your mind?", "Tell me more.", "That's interesting!"],
  surprised: ["Whoa!", "Oh!", "Did you see that?"],
  thinking: ["Analyzing...", "Let me think...", "Processing your thoughts."]
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
  
  const lastActivityRef = useRef(Date.now());
  const roamIntervalRef = useRef<NodeJS.Timeout | null>(null);
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

  const showMessage = useCallback((text?: string) => {
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
  }, [emotion]);

  const updatePosition = useCallback(() => {
    if (!isRoaming) {
      setPosition({ x: 0, y: 0 });
      return;
    }

    const padding = 150;
    const maxX = window.innerWidth - padding * 2;
    const maxY = window.innerHeight - padding * 2;
    
    const targetX = Math.random() * maxX - (window.innerWidth - padding);
    const targetY = Math.random() * maxY - (window.innerHeight - padding);

    setPosition({ x: targetX, y: targetY });
    
    const emotions: MascotEmotion[] = ['happy', 'curious', 'neutral', 'thinking'];
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
        mouseX.set(normalizedX * 10);
        mouseY.set(normalizedY * 10);
      }

      if (e instanceof KeyboardEvent) {
        setEmotion('thinking');
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          setEmotion('neutral');
        }, 2000);
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
    } else {
      if (roamIntervalRef.current) clearInterval(roamIntervalRef.current);
      setPosition({ x: 0, y: 0 });
    }
    return () => {
      if (roamIntervalRef.current) clearInterval(roamIntervalRef.current);
    };
  }, [isRoaming, updatePosition]);

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
  const isOnboardingPage = pathname === '/onboarding';
  
  if (!isLoaded || !isSignedIn || isAuthPage || isLandingPage || isOnboardingPage) {
    return null;
  }

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-[9999] pointer-events-auto cursor-pointer"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ 
        opacity: 1,
        scale: isRoaming ? 1.15 : 1,
        x: position.x,
        y: position.y,
        rotate: isRoaming ? [0, -5, 5, 0] : 0
      }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{ 
        type: 'spring', 
        damping: 35, 
        stiffness: 40,
        x: { duration: 5, ease: "easeInOut" },
        y: { duration: 5, ease: "easeInOut" },
        scale: { type: 'spring', stiffness: 200, damping: 20 }
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
        const nextEmotions: MascotEmotion[] = ['happy', 'surprised', 'curious'];
        const next = nextEmotions[Math.floor(Math.random() * nextEmotions.length)] ?? 'happy';
        setEmotion(next);
        showMessage();
        setPosition(prev => ({ ...prev, y: prev.y - 30 }));
        setTimeout(() => setPosition(prev => ({ ...prev, y: prev.y + 30 })), 250);
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
            className="absolute top-0 right-0 text-2xl font-bold text-blue-400/60 pointer-events-none select-none italic"
          >
            <motion.span
              animate={{ 
                opacity: [0.4, 1, 0.4], 
                scale: [1, 1.4, 1],
                y: [0, -20, -40],
                x: [0, 10, 20]
              }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              Zzz
            </motion.span>
          </motion.div>
        )}
        
        {emotion === 'thinking' && !message && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1, y: -45, x: -30 }}
            exit={{ opacity: 0, scale: 0 }}
            className="absolute top-0 left-0 text-xl pointer-events-none select-none"
          >
            💭
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
