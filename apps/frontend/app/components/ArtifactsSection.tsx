'use client';

import { LazyMotion, domAnimation, m } from 'framer-motion';
import { BookOpen, Camera, Link2, Music } from 'lucide-react';
import React from 'react';

const artifacts = [
  {
    title: 'The Digital Scrapbook',
    description:
      'A free-form canvas for collages. Layer photos, memories, and sketches with tactile depth.',
    Icon: Camera,
    color: 'bg-aura-joy/20',
    borderColor: 'border-aura-joy/30',
  },
  {
    title: 'Media Library Bookmark',
    description: 'Save meaningful music and podcasts. Generates elegant, stylized preview cards.',
    Icon: Music,
    color: 'bg-aura-focus/20',
    borderColor: 'border-aura-focus/30',
  },
  {
    title: 'Personalized Time Capsule',
    description:
      'Seal entries until a fixed future date. Encrypted and locked away for your future self.',
    Icon: Link2,
    color: 'bg-aura-anxiety/20',
    borderColor: 'border-aura-anxiety/30',
  },
  {
    title: 'Habit & Routine Tracker',
    description: 'Log micro-habits and link them to reflections. Visualize your growth over time.',
    Icon: BookOpen,
    color: 'bg-aura-melancholy/10',
    borderColor: 'border-aura-melancholy/20',
  },
];

export const ArtifactsSection = () => {
  return (
    <section className="relative py-40 bg-base-cream dark:bg-base-charcoal overflow-hidden">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-24 space-y-6">
          <h2 className="font-editorial text-5xl md:text-7xl dark:text-base-cream text-slate-900">
            Beyond <span className="italic">Standard Text</span>
          </h2>
          <p className="font-clarity text-slate-500 dark:text-slate-400 max-w-lg mx-auto text-lg leading-relaxed">
            The Life Canvas supports diverse media formats in structured ways, transforming raw data
            into meaningful artifacts.
          </p>
        </div>

        <LazyMotion features={domAnimation}>
          <div className="grid md:grid-cols-2 gap-8">
            {artifacts.map((artifact, i) => (
              <m.div
                key={artifact.title}
                whileHover={{ y: -10 }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className={`relative p-10 rounded-[2rem] border ${artifact.borderColor} ${artifact.color} backdrop-blur-sm group overflow-hidden`}
              >
                <div className="absolute -right-8 -bottom-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <artifact.Icon size={160} />
                </div>

                <div className="relative z-10 space-y-6">
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-base-charcoal flex items-center justify-center shadow-lg">
                    <artifact.Icon className="text-slate-800 dark:text-slate-200" size={24} />
                  </div>

                  <h3 className="font-editorial text-3xl text-slate-900 dark:text-base-cream">
                    {artifact.title}
                  </h3>

                  <p className="font-clarity text-slate-600 dark:text-slate-400 leading-relaxed">
                    {artifact.description}
                  </p>

                  <div className="pt-4">
                    <button
                      type="button"
                      className="font-clarity text-xs tracking-[0.2em] uppercase text-slate-400 hover:text-slate-900 dark:hover:text-base-cream transition-colors"
                    >
                      Learn More
                    </button>
                  </div>
                </div>
              </m.div>
            ))}
          </div>
        </LazyMotion>
      </div>
    </section>
  );
};
