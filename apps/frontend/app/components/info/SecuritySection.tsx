'use client';

import { Shield, Key, Lock, Fingerprint, EyeOff, Server } from 'lucide-react';

export default function SecuritySection() {
  const pillars = [
    {
      icon: Lock,
      title: 'End-to-End Encryption',
      text: 'Every keystroke is scrambled using military-grade AES-256 encryption before it ever leaves your device. Not even we have the keys to read your thoughts.',
    },
    {
      icon: Server,
      title: 'Zero-Knowledge Architecture',
      text: 'Our servers act merely as blind couriers. They sync encrypted packets without ever understanding the contents. Your mind remains a black box to us.',
    },
    {
      icon: EyeOff,
      title: 'Privacy by Default',
      text: 'We do not collect telemetry on what you write. We do not use your data to train AI models. Privacy is not an opt-in toggle; it is the absolute baseline.',
    },
    {
      icon: Fingerprint,
      title: 'Biometric Locking',
      text: 'Lock your Soouls app behind FaceID or TouchID. Even if your device is unlocked and handed to a friend, your journal remains sealed.',
    },
    {
      icon: Key,
      title: 'Self-Destruct Keys',
      text: 'Optional panic mode: set a protocol that permanently deletes your cloud archive and local device data if entered, leaving zero trace.',
    },
    {
      icon: Shield,
      title: 'Independent Audits',
      text: 'Our cryptographic implementation is regularly audited by independent security researchers to ensure no backdoors or vulnerabilities exist.',
    }
  ];

  return (
    <section id="security" className="relative w-full py-10 bg-transparent overflow-hidden">
      <div className="relative z-10 max-w-[1240px] mx-auto">
        
        {/* Header */}
        <div className="max-w-[800px] mb-16 md:mb-24 mx-auto text-center reveal">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#E07A5F]/10 mb-6">
            <Shield className="w-6 h-6 text-[#E07A5F]" />
          </div>
          <p className="font-urbanist text-[11px] font-bold text-[#E07A5F] tracking-[0.4em] uppercase mb-6 block">
            Security & Architecture
          </p>
          <h1 className="font-playfair text-4xl sm:text-5xl md:text-7xl font-bold text-[var(--ink)] leading-tight mb-8">
            Your thoughts are <br className="hidden md:block"/> <em className="italic text-[#E07A5F]">strictly yours</em>
          </h1>
          <p className="font-urbanist text-lg text-[var(--ink-soft)] max-w-xl mx-auto leading-relaxed">
            We build with the assumption that your private thoughts shouldn't even be readable by us. Security isn't a feature; it's the foundation of tranquility.
          </p>
        </div>

        {/* Security Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20 md:mb-32">
          {pillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="group relative bg-[#fdfaf6]/60 backdrop-blur-md border border-[#e3dbcd]/50 rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-10 transition-colors transition-transform transition-shadow duration-300 hover:bg-white hover:shadow-[0_20px_40px_rgba(224,122,95,0.08)] hover:-translate-y-2 reveal overflow-hidden"
                style={{ transitionDelay: `${(idx % 3) * 150}ms` }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#E07A5F]/5 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-[#e3dbcd] shadow-sm flex items-center justify-center text-[#E07A5F] mb-8 group-active:scale-95 group-hover:-rotate-3 transition-transform duration-300">
                    <Icon size={24} strokeWidth={1.5} />
                  </div>
                  <h3 className="font-playfair text-2xl font-bold text-[var(--ink)] mb-4">{item.title}</h3>
                  <p className="font-urbanist text-[var(--ink-soft)] leading-relaxed">{item.text}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* We don't monetize your mind */}
        <div className="max-w-[1000px] mx-auto reveal" style={{ transitionDelay: '300ms' }}>
          <div className="relative p-8 sm:p-12 md:p-24 rounded-[2rem] md:rounded-[4rem] bg-gradient-to-br from-[#fdfaf6]/80 to-[#fdfaf6]/40 backdrop-blur-3xl border border-[#e3dbcd]/60 flex flex-col items-center text-center overflow-hidden shadow-[0_8px_32px_rgba(224,122,95,0.06)] group">
            
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#E07A5F]/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:opacity-100 opacity-50 transition-opacity duration-500" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[var(--soouls-accent)]/10 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none group-hover:opacity-100 opacity-50 transition-opacity duration-500" />
            
            <div className="relative z-10 max-w-2xl">
              <span className="inline-flex p-4 rounded-3xl bg-white border border-[#e3dbcd] mb-10 text-[#E07A5F] shadow-sm group-active:scale-95 transition-transform duration-300">
                <EyeOff className="w-8 h-8" strokeWidth={1.5} />
              </span>
              <h3 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--ink)] mb-8">
                We don't <em className="italic text-[#E07A5F]">monetize</em> your mind
              </h3>
              <p className="font-urbanist text-[var(--ink-soft)] text-lg leading-relaxed mb-16">
                You are our customer, not our product. We will never sell your data, use it for
                advertising, or feed it into large language models without your explicit consent for
                personalized features.
              </p>

              <div className="pt-12 border-t border-[#e3dbcd]/50 w-full flex flex-col items-center">
                <p className="font-urbanist text-[11px] font-bold text-[var(--ink-soft)] font-semibold tracking-tight mb-6">
                  Found a vulnerability?
                </p>
                <a
                  href="mailto:safety@soouls.in"
                  className="inline-flex px-10 py-5 bg-[var(--ink)] text-[#f7f3ec] font-urbanist font-bold tracking-widest text-sm uppercase rounded-full active:scale-[0.97] transition-all duration-200"
                >
                  safety@soouls.in
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
