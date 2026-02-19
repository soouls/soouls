'use client';

import { Button } from '@soulcanvas/ui-kit';
import { AnimatePresence, LazyMotion, domAnimation, m } from 'framer-motion';
import { Fingerprint, Lock, Smartphone } from 'lucide-react';
import React, { useState } from 'react';

export const VaultSection = () => {
  const [locked, setLocked] = useState(true);
  const [holding, setHolding] = useState(false);

  return (
    <section className="relative py-40 bg-base-charcoal text-base-cream overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-20 items-center">
        <div className="space-y-8">
          <div className="inline-block px-4 py-1.5 rounded-full border border-aura-anxiety/30 bg-aura-anxiety/10 backdrop-blur-md">
            <span className="font-clarity text-xs tracking-[0.1em] uppercase text-aura-anxiety font-medium">
              Privacy First • Zero-Knowledge
            </span>
          </div>

          <h2 className="font-editorial text-5xl md:text-7xl">
            A Safe Space to <br />
            <span className="italic">Be Yourself</span>
          </h2>

          <p className="font-clarity text-xl text-slate-400 leading-relaxed max-w-lg">
            Your data is yours. Encrypted locally and secured with biometric authentication. The
            Vault ensures your most private thoughts stay private.
          </p>

          <ul className="space-y-4 font-clarity text-slate-300">
            <li className="flex items-center gap-3">
              <Lock size={18} className="text-aura-focus" />
              AES-256 local-first encryption
            </li>
            <li className="flex items-center gap-3">
              <Smartphone size={18} className="text-aura-focus" />
              FaceID / TouchID integration
            </li>
            <li className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-aura-anxiety/50" />
              Burn After Reading mode
            </li>
          </ul>
        </div>

        {/* Interactive Vault Demo */}
        <div className="relative aspect-square max-w-md mx-auto w-full">
          <div className="absolute inset-0 bg-aura-anxiety/5 blur-3xl rounded-full" />

          <LazyMotion features={domAnimation}>
            <m.div
              className="relative h-full w-full rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl flex flex-col items-center justify-center space-y-8 p-10 shadow-2xl"
              animate={{
                borderColor: locked ? 'rgba(255, 255, 255, 0.1)' : 'rgba(153, 246, 228, 0.3)',
              }}
            >
              <AnimatePresence mode="wait">
                {locked ? (
                  <m.div
                    key="locked"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.2 }}
                    className="text-center space-y-6"
                  >
                    <div className="relative inline-block">
                      <m.div
                        className="absolute -inset-4 bg-aura-focus/20 rounded-full blur-xl"
                        animate={{ scale: holding ? 1.5 : 1, opacity: holding ? 0.8 : 0.3 }}
                      />
                      <Fingerprint size={80} className="text-aura-focus relative" />
                    </div>
                    <p className="font-clarity text-sm tracking-widest uppercase opacity-50">
                      Hold to Unlock
                    </p>
                    <div
                      className="cursor-pointer select-none"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === ' ' || e.key === 'Enter') setHolding(true);
                      }}
                      onKeyUp={() => setHolding(false)}
                      onMouseDown={() => {
                        setHolding(true);
                        setTimeout(() => {
                          if (holding) setLocked(false);
                        }, 1500);
                      }}
                      onMouseUp={() => setHolding(false)}
                      onTouchStart={() => setHolding(true)}
                      onTouchEnd={() => setHolding(false)}
                    >
                      <div className="w-40 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <m.div
                          className="h-full bg-aura-focus"
                          initial={{ width: 0 }}
                          animate={{ width: holding ? '100%' : '0%' }}
                          transition={{ duration: 1.5, ease: 'linear' }}
                          onAnimationComplete={() => {
                            if (holding) setLocked(false);
                          }}
                        />
                      </div>
                    </div>
                  </m.div>
                ) : (
                  <m.div
                    key="unlocked"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-6"
                  >
                    <div className="font-editorial text-3xl italic text-aura-focus">
                      Welcome to Your Space
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { id: 'skeleton-1' },
                        { id: 'skeleton-2' },
                        { id: 'skeleton-3' },
                        { id: 'skeleton-4' },
                      ].map((item) => (
                        <div
                          key={item.id}
                          className="h-20 w-full rounded-lg bg-white/5 border border-white/5 animate-pulse"
                        />
                      ))}
                    </div>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setLocked(true);
                        setHolding(false);
                      }}
                    >
                      Relock Vault
                    </Button>
                  </m.div>
                )}
              </AnimatePresence>
            </m.div>
          </LazyMotion>
        </div>
      </div>
    </section>
  );
};
