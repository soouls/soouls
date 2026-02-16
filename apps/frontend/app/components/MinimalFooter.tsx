'use client';

import React from 'react';

export const MinimalFooter = () => {
  return (
    <footer className="relative py-20 bg-base-cream dark:bg-base-charcoal border-t border-slate-100 dark:border-white/5">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="space-y-4 text-center md:text-left">
            <h3 className="font-editorial text-2xl tracking-tight text-slate-900 dark:text-base-cream">
              SoulCanvas
            </h3>
            <p className="font-clarity text-sm text-slate-400 max-w-xs leading-relaxed">
              Transforming the act of daily documentation into a highly aesthetic, deeply meaningful
              experience.
            </p>
          </div>

          <div className="flex gap-12 font-clarity text-sm tracking-widest uppercase text-slate-400">
            <a
              href="#"
              className="hover:text-slate-900 dark:hover:text-base-cream transition-colors"
            >
              Waitlist
            </a>
            <a
              href="#"
              className="hover:text-slate-900 dark:hover:text-base-cream transition-colors"
            >
              Philosophy
            </a>
            <a
              href="#"
              className="hover:text-slate-900 dark:hover:text-base-cream transition-colors"
            >
              Privacy
            </a>
          </div>

          <div className="font-clarity text-xs text-slate-300 dark:text-slate-600">
            © 2026 Rudra1959. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};
