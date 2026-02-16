'use client';

import { RiverTimeline } from '@soulcanvas/ui-kit';
import React from 'react';

const mockEntries = [
  {
    date: 'Autumn 2025',
    content:
      "The first leaf fell today, and for once, I didn't feel the rush to document it immediately. I just sat there.",
    sentiment: 'joy' as const,
  },
  {
    date: 'August 14, 2025',
    content:
      "Meeting with the team. Feels like we're building something that actually matters. A bit overwhelmed, but the good kind.",
    sentiment: 'focus' as const,
  },
  {
    date: 'July 02, 2025',
    content: 'The City is too loud today. Looking for that quiet place within.',
    sentiment: 'melancholy' as const,
  },
  {
    date: 'June 28, 2025',
    content: 'Why does everything feel like a race? I just want to pause.',
    sentiment: 'anxiety' as const,
  },
];

export const TimelineSection = () => {
  return (
    <section className="relative py-40 bg-base-cream dark:bg-base-charcoal">
      <div className="max-w-4xl mx-auto px-4 text-center mb-24">
        <h2 className="font-editorial text-4xl md:text-6xl mb-6 text-slate-900 dark:text-base-cream">
          The River of Time
        </h2>
        <p className="font-clarity text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
          A seamless, non-linear architecture that lets your life flow naturally. No cards. No
          boundaries. Just your story.
        </p>
      </div>

      <RiverTimeline entries={mockEntries} />

      {/* Decorative fade at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-slate-200/20 dark:from-slate-800/20 to-transparent pointer-events-none" />
    </section>
  );
};
