'use client';

import { Briefcase, ArrowRight, Compass } from 'lucide-react';

export default function CareersSection() {
  const vacancies = [
    {
      title: 'Experience Designer',
      type: 'FULL-TIME',
      location: 'REMOTE',
      description: 'Crafting the calmest digital experiences ever made. Help us invent the future of the Spatial Canvas.',
    },
    {
      title: 'Core Engineer',
      type: 'FULL-TIME',
      location: 'REMOTE',
      description: 'Building the highly performant, local-first engine behind our canvas using modern sync technologies.',
    },
    {
      title: 'Community Lead',
      type: 'PART-TIME',
      location: 'REMOTE',
      description: 'Nurture our sanctuary of thinkers. Foster deep conversations and gather profound product insights.',
    }
  ];

  return (
    <section id="careers" className="relative w-full py-10 bg-transparent overflow-hidden">
      <div className="relative z-10 max-w-[1240px] mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 md:mb-24 gap-12 reveal">
          <div className="max-w-2xl">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#E07A5F]/10 mb-6">
              <Briefcase className="w-6 h-6 text-[#E07A5F]" />
            </div>
            <span className="font-urbanist text-[11px] font-bold text-[#E07A5F] font-semibold tracking-tight mb-6 block">
              Careers
            </span>
            <h1 className="font-playfair text-4xl sm:text-5xl md:text-7xl font-bold text-[var(--ink)] leading-[1.1] mb-6">
              Come build something <br /> <em className="italic text-[#E07A5F]">that matters</em>
            </h1>
            <p className="inline-flex items-center gap-2 font-urbanist text-[12px] font-bold text-[#E07A5F] bg-[#E07A5F]/10 px-4 py-2 rounded-full font-semibold tracking-tight">
              <Compass className="w-4 h-4" />
              Remote-first team
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end text-left md:text-right max-w-sm">
            <div className="p-6 rounded-3xl bg-[#fdfaf6]/60 backdrop-blur-md border border-[#e3dbcd]/50 shadow-sm relative">
              <div className="absolute -left-3 top-6 text-4xl text-[#E07A5F]/30 font-playfair italic">"</div>
              <p className="font-urbanist text-lg text-[var(--ink-soft)] leading-relaxed italic relative z-10">
                We are looking for souls who find beauty in precision and purpose in silence.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16 mb-20 md:mb-32">
          
          {/* Values Column */}
          <div className="lg:col-span-5 flex flex-col gap-10 reveal" style={{ transitionDelay: '100ms' }}>
            <h3 className="font-playfair text-3xl font-bold text-[var(--ink)] mb-4">Our Culture</h3>
            {[
              {
                label: 'Small team',
                text: 'We are lean by choice. Every individual has massive agency and ownership over the product.',
              },
              {
                label: 'Thoughtful work',
                text: "We don't ship just to ship. We ship when the experience feels right, beautifully animated, and completely bug-free.",
              },
              {
                label: 'Quality over speed',
                text: 'Our deadlines are human. Our aesthetic standards are atmospheric. We want everything to feel like a piece of art.',
              },
            ].map((value, idx) => (
              <div key={idx} className="group relative pl-8 border-l-2 border-[#e3dbcd] hover:border-[#E07A5F] transition-colors duration-300">
                <div className="absolute left-[-5px] top-2 w-2 h-2 rounded-full bg-[#e3dbcd] group-hover:bg-[#E07A5F] group-hover:scale-150 transition-colors transition-transform transition-shadow duration-300" />
                <h4 className="font-urbanist font-bold text-[var(--ink)] text-xl mb-3 tracking-wide">
                  {value.label}
                </h4>
                <p className="font-urbanist text-[var(--ink-soft)] text-lg leading-relaxed">
                  {value.text}
                </p>
              </div>
            ))}
          </div>

          {/* Vacancies Column */}
          <div className="lg:col-span-7 space-y-8 reveal" style={{ transitionDelay: '200ms' }}>
            <div className="flex items-center gap-4 mb-6">
              <span className="h-px bg-[#e3dbcd] flex-1" />
              <h3 className="font-urbanist text-xs font-bold text-[#E07A5F] font-semibold tracking-tight">
                Current Openings
              </h3>
              <span className="h-px bg-[#e3dbcd] flex-1" />
            </div>

            {vacancies.map((job, idx) => (
              <div
                key={idx}
                className="group relative p-6 md:p-10 rounded-3xl md:rounded-[3rem] bg-[#fdfaf6]/60 backdrop-blur-md border border-[#e3dbcd]/50 hover:bg-white hover:border-[#E07A5F]/40 hover:shadow-[0_20px_40px_rgba(224,122,95,0.08)] hover:-translate-y-2 transition-colors transition-transform transition-shadow duration-300 cursor-pointer overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-[#E07A5F]/5 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                
                <div className="relative z-10">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <h4 className="font-playfair text-3xl font-bold text-[var(--ink)] group-hover:text-[#E07A5F] transition-colors duration-300">
                      {job.title}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-[10px] font-bold text-[var(--ink-soft)] border border-[#e3dbcd] bg-white px-3 py-1.5 rounded-full font-semibold tracking-tight">
                        {job.location}
                      </span>
                      <span className="text-[10px] font-bold text-[#E07A5F] bg-[#E07A5F]/10 px-3 py-1.5 rounded-full font-semibold tracking-tight">
                        {job.type}
                      </span>
                    </div>
                  </div>
                  <p className="font-urbanist text-lg text-[var(--ink-soft)] mb-8 max-w-xl leading-relaxed">
                    {job.description}
                  </p>
                  <div className="inline-flex items-center gap-2 font-urbanist text-xs font-bold text-[var(--ink)] uppercase tracking-widest group-hover:text-[#E07A5F] transition-colors">
                    View position <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Join the Sanctuary CTA */}
        <div className="max-w-[1000px] mx-auto reveal" style={{ transitionDelay: '300ms' }}>
          <div className="relative p-8 sm:p-12 md:p-24 rounded-3xl md:rounded-[2.5rem] md:rounded-[4rem] bg-gradient-to-br from-[var(--ink)] to-[#2a251e] border border-[#e3dbcd]/20 shadow-[0_20px_60px_rgba(22,19,15,0.3)] flex flex-col items-center text-center overflow-hidden group">
            
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--soouls-accent)]/20 rounded-full blur-[100px] opacity-50 group-hover:opacity-80 group-active:scale-95 transition-colors transition-transform transition-shadow duration-500 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#6450d6]/20 rounded-full blur-[100px] opacity-30 group-hover:opacity-60 group-active:scale-95 transition-colors transition-transform transition-shadow duration-500 pointer-events-none" />
            
            <div className="relative z-10 max-w-2xl">
              <h3 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-bold text-[#f7f3ec] mb-6">
                Join the <em className="italic text-[var(--soouls-accent)]">sanctuary</em>
              </h3>
              <p className="font-urbanist text-[#928a7c] text-lg mb-12 mx-auto leading-relaxed">
                Don't see a role that fits? We are always looking for passionate thinkers, designers, and builders. Tell us why you belong here.
              </p>
              <button
                type="button"
                className="group/btn inline-flex items-center gap-2 px-10 py-5 bg-[var(--soouls-accent)] text-white font-urbanist font-bold text-sm font-semibold tracking-tight rounded-full active:scale-[0.97] transition-all duration-200 shadow-[0_10px_30px_rgba(217,138,75,0.3)]"
              >
                Send us your story
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
