'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        key={pathname} 
        className="w-full h-full flex flex-col flex-1 relative"
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {/* GLOBAL FULL SCREEN OPENING TRANSITION */}
        <motion.div
          variants={{
            initial: { height: '50vh', opacity: 1 },
            animate: { height: '0vh', opacity: 1, transition: { duration: 1.2, ease: [0.87, 0, 0.13, 1], delay: 0.1 } },
            exit: { height: '50vh', opacity: 1, transition: { duration: 0.8, ease: [0.87, 0, 0.13, 1] } }
          }}
          className="fixed top-0 left-0 w-full z-[9999] pointer-events-none backdrop-blur-3xl flex items-end overflow-hidden"
          style={{
            backgroundColor: 'rgba(10, 10, 10, 0.95)',
            borderBottom: '1px solid color-mix(in srgb, var(--soouls-accent) 50%, transparent)',
            boxShadow: '0 30px 100px color-mix(in srgb, var(--soouls-accent) 40%, transparent)',
          }}
        >
          <div 
            className="w-full h-40" 
            style={{ 
              background: 'linear-gradient(to top, color-mix(in srgb, var(--soouls-accent) 20%, transparent), transparent)' 
            }} 
          />
        </motion.div>

        <motion.div
          variants={{
            initial: { height: '50vh', opacity: 1 },
            animate: { height: '0vh', opacity: 1, transition: { duration: 1.2, ease: [0.87, 0, 0.13, 1], delay: 0.1 } },
            exit: { height: '50vh', opacity: 1, transition: { duration: 0.8, ease: [0.87, 0, 0.13, 1] } }
          }}
          className="fixed bottom-0 left-0 w-full z-[9999] pointer-events-none backdrop-blur-3xl flex items-start overflow-hidden"
          style={{
            backgroundColor: 'rgba(10, 10, 10, 0.95)',
            borderTop: '1px solid color-mix(in srgb, var(--soouls-accent) 50%, transparent)',
            boxShadow: '0 -30px 100px color-mix(in srgb, var(--soouls-accent) 40%, transparent)',
          }}
        >
          <div 
            className="w-full h-40" 
            style={{ 
              background: 'linear-gradient(to bottom, color-mix(in srgb, var(--soouls-accent) 20%, transparent), transparent)' 
            }} 
          />
        </motion.div>

        <motion.div
          variants={{
            initial: { opacity: 1, height: '4px', filter: 'blur(2px)' },
            animate: { opacity: 0, height: '0px', filter: 'blur(10px)', transition: { duration: 0.6, ease: 'easeOut', delay: 0.2 } },
            exit: { opacity: 1, height: '4px', filter: 'blur(2px)', transition: { duration: 0.4, ease: 'easeIn' } }
          }}
          className="fixed top-1/2 left-0 w-full -translate-y-1/2 z-[10000] pointer-events-none"
          style={{
            backgroundColor: 'var(--soouls-accent)',
            boxShadow: '0 0 80px var(--soouls-accent), 0 0 20px var(--soouls-accent)',
          }}
        />

        <motion.div 
          variants={{
            initial: { opacity: 0, scale: 0.98, filter: 'blur(8px)' },
            animate: { opacity: 1, scale: 1, filter: 'blur(0px)', transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.4 } },
            exit: { opacity: 0, scale: 0.98, filter: 'blur(8px)', transition: { duration: 0.4, ease: 'easeIn' } }
          }}
          className="w-full h-full flex flex-col flex-1 relative z-0"
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
