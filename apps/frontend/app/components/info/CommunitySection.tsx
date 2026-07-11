'use client';

import { Users, MessagesSquare, Sparkles, MoveRight } from 'lucide-react';
import { SiDiscord, SiInstagram, SiX } from 'react-icons/si';

export default function CommunitySection() {
  const socials = [
    {
      icon: <SiDiscord className="w-8 h-8" />,
      label: 'Discord Sanctuary',
      text: 'Chat with the community and team. Share your thoughts, ask questions, and find your quiet corner.',
      href: 'https://discord.gg/soouls',
      color: '#5865F2',
    },
    {
      icon: <SiX className="w-8 h-8" />,
      label: 'X / Twitter',
      text: 'Daily insights, product updates, and philosophical musings on the nature of thought.',
      href: 'https://x.com/soouls_app',
      color: '#000000',
    },
    {
      icon: <SiInstagram className="w-8 h-8" />,
      label: 'Instagram',
      text: 'Visual meditations, workspace inspiration, and stories from the Soouls ecosystem.',
      href: 'https://instagram.com/soouls.in',
      color: '#E1306C',
    },
  ];

  return (
    <section id="community" className="relative w-full py-10 bg-transparent overflow-hidden">
      <div className="relative z-10 max-w-[1240px] mx-auto">
        
        {/* Header */}
        <div className="mb-16 md:mb-24 flex flex-col items-center text-center max-w-[800px] mx-auto reveal">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#E07A5F]/10 mb-6">
            <Users className="w-6 h-6 text-[#E07A5F]" />
          </div>
          <span className="font-urbanist text-[11px] font-bold text-[#E07A5F] font-semibold tracking-tight mb-6 block">
            Community
          </span>
          <h2 className="font-playfair text-4xl sm:text-5xl md:text-7xl font-bold text-[var(--ink)] leading-tight mb-8">
            You're not <br/> <em className="italic text-[#E07A5F]">alone</em> in this
          </h2>
          <p className="font-urbanist text-lg text-[var(--ink-soft)] max-w-xl mx-auto leading-relaxed">
            Join a sanctuary of thinkers, creators, and seekers who believe in slow evolution and profound focus.
          </p>
        </div>

        {/* Community Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mb-20 md:mb-32">
          {socials.map((item, idx) => (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="group relative p-12 rounded-3xl md:rounded-[3rem] bg-[#fdfaf6]/60 backdrop-blur-md border border-[#e3dbcd]/50 hover:bg-white hover:shadow-[0_20px_40px_rgba(224,122,95,0.08)] hover:-translate-y-2 transition-colors transition-transform transition-shadow duration-300 flex flex-col items-center text-center overflow-hidden reveal"
              style={{ transitionDelay: `${(idx % 3) * 150}ms` }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#E07A5F]/5 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              
              <div className="relative z-10">
                <div
                  className="w-20 h-20 mx-auto rounded-3xl bg-white border border-[#e3dbcd] shadow-sm flex items-center justify-center mb-8 group-active:scale-95 group-hover:rotate-3 transition-transform duration-300"
                  style={{ color: item.color }}
                >
                  {item.icon}
                </div>
                <h3 className="font-playfair text-3xl font-bold text-[var(--ink)] mb-4">
                  {item.label}
                </h3>
                <p className="font-urbanist text-[var(--ink-soft)] leading-relaxed mb-10">
                  {item.text}
                </p>
                <div className="inline-flex items-center gap-2 font-urbanist text-xs font-bold text-[var(--ink)] uppercase tracking-widest mt-auto group-hover:text-[#E07A5F] transition-colors">
                  Join sanctuary <MoveRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Testimonials or Manifesto */}
        <div className="max-w-[1000px] mx-auto reveal" style={{ transitionDelay: '300ms' }}>
          <div className="relative p-8 sm:p-12 md:p-24 rounded-3xl md:rounded-[2.5rem] md:rounded-[4rem] bg-gradient-to-br from-[#fdfaf6]/80 to-[#fdfaf6]/40 backdrop-blur-3xl border border-[#e3dbcd]/60 flex flex-col items-center text-center overflow-hidden shadow-[0_8px_32px_rgba(224,122,95,0.06)] group">
            
            <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-[#E07A5F]/10 blur-[80px] rounded-full -translate-y-1/2 -translate-x-1/2 pointer-events-none group-hover:opacity-100 opacity-50 transition-opacity duration-500" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[var(--soouls-accent)]/10 blur-[80px] rounded-full translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:opacity-100 opacity-50 transition-opacity duration-500" />
            
            <div className="relative z-10 max-w-2xl">
              <span className="inline-flex p-4 rounded-3xl bg-white border border-[#e3dbcd] mb-10 text-[var(--soouls-accent)] shadow-sm group-active:scale-95 transition-transform duration-300">
                <MessagesSquare className="w-8 h-8" strokeWidth={1.5} />
              </span>
              <h3 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--ink)] mb-8">
                Share your <em className="italic text-[var(--soouls-accent)]">story</em>
              </h3>
              <p className="font-urbanist text-[var(--ink-soft)] text-lg leading-relaxed mb-12">
                The best features of Soouls were born from quiet conversations with our users. If you have an idea, a grievance, or just want to tell us how you use the app, we are always listening.
              </p>

              <a
                href="mailto:hello@soouls.in"
                className="inline-flex items-center gap-2 px-10 py-5 bg-[var(--ink)] text-[#f7f3ec] font-urbanist font-bold tracking-widest text-sm uppercase rounded-full active:scale-[0.97] transition-all duration-200"
              >
                <Sparkles className="w-4 h-4" />
                hello@soouls.in
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
