'use client';

import { AuraBackground, Button, LifeCanvas3D } from '@soulcanvas/ui-kit';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

export function HeroSection() {
  return (
    <section className="relative min-h-[110vh] flex flex-col items-center justify-center overflow-hidden bg-base-cream dark:bg-base-charcoal">
      {/* Dynamic Backgrounds */}
      <AuraBackground />
      <LifeCanvas3D />

      {/* Content Overlay */}
      <LazyMotion features={domAnimation}>
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <m.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8"
          >
            <div className="inline-block px-4 py-1.5 rounded-full border border-aura-focus/30 bg-aura-focus/10 backdrop-blur-md">
              <span className="font-clarity text-xs tracking-[0.2em] uppercase text-aura-focus font-medium">
                Coming Soon • Digital Life Archive
              </span>
            </div>

            <h1 className="font-editorial text-6xl md:text-9xl tracking-tight leading-[0.9] text-slate-900 dark:text-base-cream">
              Document <br />
              <span className="italic pl-4 md:pl-20">the Soul</span>
            </h1>

            <p className="max-w-xl mx-auto font-clarity text-lg md:text-xl text-slate-500 dark:text-slate-400 leading-relaxed">
              A Personal Chronographer that transforms your daily reflections into a living,
              breathing digital sanctuary.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-10">
              <Link href="/sign-up">
                <Button
                  size="lg"
                  className="px-10 py-8 text-lg rounded-full shadow-2xl shadow-aura-focus/20 transition-all hover:scale-105 active:scale-95"
                >
                  Join the Waitlist
                </Button>
              </Link>
              <Link href="/sign-up">
                <button
                  type="button"
                  className="font-clarity text-sm tracking-widest uppercase hover:opacity-100 transition-opacity opacity-50 text-slate-900 dark:text-base-cream"
                >
                  The Vision
                </button>
              </Link>
            </div>
          </m.div>
        </div>

        {/* Scroll Indicator */}
        <m.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5, y: [0, 10, 0] }}
          transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
        >
          <ChevronDown size={32} className="text-slate-400" />
        </m.div>
      </LazyMotion>

      {/* Fog/Atmosphere transition at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-base-cream dark:from-base-charcoal to-transparent pointer-events-none z-10" />
    </section>
  );
}
