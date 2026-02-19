'use client';

import { Button } from '@soulcanvas/ui-kit';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import React from 'react';

export const SundayReviewSection = () => {
  return (
    <section className="relative py-60 bg-base-cream dark:bg-base-charcoal overflow-hidden">
      {/* Decorative Aura Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10 bg-aura-joy/5 blur-[120px] rounded-full" />

      <LazyMotion features={domAnimation}>
        <div className="max-w-4xl mx-auto px-4 text-center space-y-12">
          <m.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="space-y-6"
          >
            <span className="font-clarity text-xs tracking-[0.3em] uppercase text-slate-400">
              Every Sunday @ 9:00 AM
            </span>

            <h2 className="font-editorial text-6xl md:text-8xl leading-[1.1] text-slate-900 dark:text-base-cream">
              The <span className="italic">Sunday Review</span>
            </h2>

            <p className="font-clarity text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              A beautifully typeset, single-screen summary of your week. No pressure, just gentle
              awareness of your emotional journey.
            </p>
          </m.div>

          {/* Legacy Card Mockup */}
          <m.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative max-w-sm mx-auto p-12 aspect-[3/4] bg-white dark:bg-base-charcoal border border-slate-200 dark:border-white/10 shadow-2xl rounded-[3rem] flex flex-col justify-between text-left"
          >
            <div className="space-y-8">
              <div className="space-y-2">
                <p className="font-clarity text-[0.6rem] tracking-[0.2em] uppercase opacity-40">
                  Highlight of the Week
                </p>
                <h4 className="font-editorial text-2xl italic leading-tight">
                  "The first leaf fell today, and for once, I didn't feel the rush."
                </h4>
              </div>

              <div className="space-y-4">
                <p className="font-clarity text-[0.6rem] tracking-[0.2em] uppercase opacity-40">
                  Dominant Auras
                </p>
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-aura-joy blur-sm opacity-60" />
                  <div className="w-8 h-8 rounded-full bg-aura-focus blur-sm opacity-60" />
                  <div className="w-8 h-8 rounded-full bg-aura-melancholy blur-sm opacity-60" />
                </div>
              </div>
            </div>

            <div className="pt-10 border-t border-slate-100 dark:border-white/5">
              <p className="font-editorial text-sm italic opacity-40">
                Sent with love from your future self.
              </p>
            </div>
          </m.div>

          <div className="pt-20">
            <Button
              size="lg"
              className="px-12 py-8 text-lg rounded-full shadow-2xl shadow-aura-joy/20"
            >
              Reserve Your Username
            </Button>
          </div>
        </div>
      </LazyMotion>
    </section>
  );
};
