'use client';

import { ArrowRight, BookText, HardDrive, Keyboard, Shield } from 'lucide-react';

export default function DocumentationSection() {
  const docs = [
    {
      icon: BookText,
      title: 'Getting Started',
      text: 'Learn the core principles of using Soouls for deep reflection and thought mapping.',
      color: '#E07A5F',
    },
    {
      icon: Shield,
      title: 'Privacy & Security',
      text: 'A detailed technical deep-dive into our zero-knowledge encryption architecture.',
      color: '#6450d6',
    },
    {
      icon: HardDrive,
      title: 'Local-First Sync',
      text: 'Understand how we seamlessly manage your offline data across all your devices.',
      color: '#2a9d8f',
    },
    {
      icon: Keyboard,
      title: 'Keyboard Shortcuts',
      text: 'Master the flow with power-user navigation guides and canvas manipulation.',
      color: '#e76f51',
    },
  ];

  return (
    <section id="documentation" className="relative w-full py-10 bg-transparent overflow-hidden">
      <div className="relative z-10 max-w-[1240px] mx-auto">
        {/* Header */}
        <div className="max-w-[700px] mb-16 md:mb-24 reveal">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#E07A5F]/10 mb-6">
            <BookText className="w-6 h-6 text-[#E07A5F]" />
          </div>
          <span className="font-urbanist text-[11px] font-bold text-[#E07A5F] font-semibold tracking-tight mb-6 block">
            Knowledge Base
          </span>
          <h1 className="font-playfair text-4xl sm:text-5xl md:text-7xl font-bold text-[var(--ink)] leading-[1.1] mb-8">
            The <em className="italic text-[#E07A5F]">Library</em>
          </h1>
          <p className="font-urbanist text-xl text-[var(--ink-soft)] leading-relaxed">
            Everything you need to master your digital sanctuary. Detailed guides, technical
            references, and philosophy.
          </p>
        </div>

        {/* Documentation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20 md:mb-32">
          {docs.map((doc, idx) => {
            const Icon = doc.icon;
            return (
              <div
                key={doc.title}
                className="group relative p-10 rounded-3xl md:rounded-[3rem] bg-[#fdfaf6]/60 backdrop-blur-md border border-[#e3dbcd]/50 hover:bg-white hover:shadow-[0_20px_40px_rgba(224,122,95,0.08)] hover:-translate-y-2 transition-colors transition-transform transition-shadow duration-300 flex flex-col reveal overflow-hidden"
                style={{ transitionDelay: `${(idx % 4) * 100}ms` }}
              >
                <div
                  className="absolute top-0 right-0 w-32 h-32 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none rounded-full blur-[40px]"
                  style={{ backgroundColor: doc.color }}
                />

                <div className="relative z-10 flex flex-col h-full">
                  <div
                    className="w-14 h-14 rounded-2xl bg-white border border-[#e3dbcd] shadow-sm flex items-center justify-center mb-8 group-active:scale-95 group-hover:rotate-3 transition-transform duration-300"
                    style={{ color: doc.color }}
                  >
                    <Icon size={24} strokeWidth={1.5} />
                  </div>

                  <h3 className="font-playfair text-2xl font-bold text-[var(--ink)] mb-4">
                    {doc.title}
                  </h3>
                  <p className="font-urbanist text-[var(--ink-soft)] leading-relaxed mb-10 flex-1">
                    {doc.text}
                  </p>

                  <div
                    className="inline-flex items-center gap-2 font-urbanist text-xs font-bold uppercase tracking-widest transition-colors mt-auto w-max"
                    style={{ color: doc.color }}
                  >
                    Read Guide{' '}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
