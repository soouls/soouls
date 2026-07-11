'use client';

import { Sparkles, Compass, Focus, Map, BookOpen } from 'lucide-react';

export default function JournalGuideSection() {
  const steps = [
    {
      id: 'start',
      icon: Compass,
      title: 'Start with a single thought',
      short: 'The canvas is endless, but every journey begins with one node.',
      content: (
        <>
          <p className="mb-4">
            When you first open Soouls, you'll see a vast, empty space. This is intentional. Unlike a traditional journal where you write linearly down a page, Soouls allows you to place thoughts anywhere.
          </p>
          <p>
            Simply double-click anywhere on the canvas to create your first thought. It could be a word, a sentence, or a feeling. Once it's there, it becomes an anchor for everything else.
          </p>
        </>
      )
    },
    {
      id: 'connect',
      icon: Map,
      title: 'Building Connections',
      short: 'Let your mind map itself naturally over time.',
      content: (
        <p>
          As you add more thoughts, you'll naturally start to see relationships. You can draw lines between nodes to represent these connections. Over time, your isolated thoughts will form a rich, interconnected map of your mind, revealing how your ideas are truly linked.
        </p>
      )
    },
    {
      id: 'review',
      icon: Focus,
      title: 'Reviewing Your Clusters',
      short: 'Zoom out to see the bigger picture.',
      content: (
        <p>
          The true magic of spatial journaling is the ability to zoom out. After a few weeks, take time to look at the clusters that have formed. You might discover recurring themes or unexpected links between ideas that you wouldn't have noticed in a linear, page-by-page journal.
        </p>
      )
    }
  ];

  return (
    <section className="relative w-full py-10 bg-transparent overflow-hidden">
      <div className="relative z-10 max-w-[900px] mx-auto">
        
        {/* Header */}
        <div className="mb-16 md:mb-24 text-center reveal">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#E07A5F]/10 mb-6">
            <BookOpen className="w-6 h-6 text-[#E07A5F]" />
          </div>
          <span className="font-urbanist text-[11px] font-bold text-[#E07A5F] font-semibold tracking-tight mb-4 block">
            Resources
          </span>
          <h1 className="font-playfair text-4xl sm:text-5xl md:text-6xl font-bold text-[var(--ink)] leading-tight mb-6">
            The Journal <span className="italic text-[#E07A5F]">Guide</span>
          </h1>
          <p className="font-urbanist text-lg text-[var(--ink-soft)] max-w-xl mx-auto">
            A gentle introduction to non-linear journaling and capturing your thoughts in a spatial canvas.
          </p>
        </div>

        {/* Animated Staggered Cards */}
        <div className="space-y-6 relative">
          
          {/* Decorative center line */}
          <div className="hidden md:block absolute left-[3.5rem] top-10 bottom-10 w-px bg-gradient-to-b from-[#E07A5F]/0 via-[#E07A5F]/30 to-[#E07A5F]/0 z-0" />

          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div 
                key={step.id} 
                id={step.id}
                className="group relative bg-[#fdfaf6]/60 backdrop-blur-md border border-[#e3dbcd]/50 rounded-2xl md:rounded-[2rem] p-6 md:p-10 transition-colors transition-transform transition-shadow duration-300 hover:bg-white/90 hover:shadow-[0_20px_40px_rgba(224,122,95,0.08)] hover:-translate-y-1 reveal z-10"
                style={{ transitionDelay: `${(idx % 5) * 100}ms` }}
              >
                {/* Decorative Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#E07A5F]/5 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                
                <div className="flex flex-col md:flex-row gap-8 relative z-10">
                  <div className="md:w-1/3 shrink-0">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-white border border-[#e3dbcd] flex items-center justify-center shadow-sm group-active:scale-95 transition-transform duration-300 shrink-0">
                        <Icon className="w-5 h-5 text-[var(--ink)] group-hover:text-[#E07A5F] transition-colors duration-300" />
                      </div>
                      <h2 className="font-playfair text-2xl font-bold text-[var(--ink)]">
                        {step.title}
                      </h2>
                    </div>
                    <div className="p-4 bg-[#E07A5F]/5 rounded-xl border border-[#E07A5F]/10 ml-0 md:ml-16">
                      <p className="font-urbanist text-sm font-bold text-[#E07A5F] leading-snug m-0">
                        {step.short}
                      </p>
                    </div>
                  </div>
                  
                  <div className="md:w-2/3 font-urbanist text-[var(--ink-soft)] leading-relaxed pt-2 md:pl-8">
                    {step.content}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-24 text-center reveal" style={{ transitionDelay: '300ms' }}>
          <div className="inline-flex items-center gap-2 text-[#E07A5F] font-urbanist font-bold uppercase tracking-widest text-sm hover:text-[var(--soouls-accent)] transition-colors cursor-pointer group">
            <Sparkles className="w-4 h-4" />
            <span className="relative">
              Open your canvas
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-[var(--soouls-accent)] transition-colors transition-transform transition-shadow duration-300 group-hover:w-full" />
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}
