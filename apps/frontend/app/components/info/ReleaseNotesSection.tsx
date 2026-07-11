'use client';

import { History, Sparkles } from 'lucide-react';

export default function ReleaseNotesSection() {
  const releases = [
    {
      version: 'v0.9.0',
      date: 'MAY 2026',
      title: 'The Motion Update',
      changes: [
        'Complete overhaul of all information pages',
        'Introduced staggered glassmorphic card animations',
        'New ambient glowing backgrounds and hover interactions',
        'Significantly improved typography rendering with Playfair',
      ],
    },
    {
      version: 'v0.8.4',
      date: 'APRIL 2026',
      title: 'The Calm Update',
      changes: [
        'Added smooth entry animations for nodes',
        'New meditation background sounds',
        'Enhanced local-first sync stability across devices',
      ],
    },
    {
      version: 'v0.8.0',
      date: 'MARCH 2026',
      title: 'Public Alpha Launch',
      changes: [
        'Initial release to early access waitlist',
        'Core infinite canvas functionality',
        'Military-grade end-to-end encryption layer',
      ],
    },
  ];

  return (
    <section id="release-notes" className="relative w-full py-10 bg-transparent overflow-hidden">
      <div className="relative z-10 max-w-[1240px] mx-auto">
        
        {/* Header */}
        <div className="max-w-2xl mb-20 md:mb-32 reveal">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#E07A5F]/10 mb-6">
            <History className="w-6 h-6 text-[#E07A5F]" />
          </div>
          <span className="font-urbanist text-[11px] font-bold text-[#E07A5F] font-semibold tracking-tight mb-6 block">
            Changelog
          </span>
          <h1 className="font-playfair text-4xl sm:text-5xl md:text-7xl font-bold text-[var(--ink)] leading-[1.1] mb-8">
            Release <em className="italic text-[#E07A5F]">Notes</em>
          </h1>
          <p className="font-urbanist text-xl text-[var(--ink-soft)] leading-relaxed">
            Charting our evolution. From the first line of code to a sanctuary for deep thoughts.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative space-y-16 max-w-[900px]">
          {/* Vertical timeline line */}
          <div className="absolute top-4 bottom-4 left-[21px] w-px bg-gradient-to-b from-[#e3dbcd] via-[#e3dbcd]/50 to-transparent" />

          {releases.map((release, idx) => (
            <div key={release.version} className="relative pl-16 md:pl-24 group reveal" style={{ transitionDelay: `${idx * 150}ms` }}>
              
              {/* Timeline Dot with Glow */}
              <div className="absolute left-[13px] top-10 flex items-center justify-center">
                <div className="absolute w-8 h-8 bg-[#E07A5F]/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative w-[18px] h-[18px] rounded-full bg-white border-[4px] border-[#E07A5F] group-hover:scale-125 transition-transform duration-300 shadow-sm z-10" />
              </div>

              {/* Card */}
              <div className="relative p-6 sm:p-8 md:p-14 rounded-3xl md:rounded-[3rem] bg-[#fdfaf6]/60 backdrop-blur-md border border-[#e3dbcd]/50 hover:bg-white hover:border-[#E07A5F]/30 hover:shadow-[0_20px_40px_rgba(224,122,95,0.06)] hover:-translate-y-1 transition-colors transition-transform transition-shadow duration-300 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#E07A5F]/5 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                
                <div className="relative z-10">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 border-b border-[#e3dbcd]/50 pb-8">
                    <div>
                      <span className="font-urbanist text-[11px] font-bold text-[#E07A5F] font-semibold tracking-tight mb-4 block">
                        {release.date}
                      </span>
                      <h3 className="font-playfair text-4xl font-bold text-[var(--ink)] group-hover:text-[#E07A5F] transition-colors duration-300">
                        {release.title}
                      </h3>
                    </div>
                    <span className="font-urbanist text-xs font-bold text-[var(--ink)] bg-[#f7f3ec] border border-[#e3dbcd] px-5 py-2.5 rounded-full tracking-widest shadow-sm group-hover:bg-[#E07A5F]/10 group-hover:text-[#E07A5F] group-hover:border-[#E07A5F]/20 transition-colors duration-300">
                      {release.version}
                    </span>
                  </div>

                  <ul className="space-y-5">
                    {release.changes.map((change, cIdx) => (
                      <li key={cIdx} className="flex items-start gap-4 font-urbanist text-[var(--ink-soft)] text-lg leading-relaxed group/item">
                        <Sparkles className="w-5 h-5 text-[#E07A5F]/40 mt-1 shrink-0 group-hover/item:text-[#E07A5F] group-hover/item:scale-110 transition-colors transition-transform transition-shadow" strokeWidth={1.5} />
                        <span>{change}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
