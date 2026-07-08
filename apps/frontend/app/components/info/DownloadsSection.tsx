'use client';

import {
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  ArrowRight
} from 'lucide-react';

export default function DownloadsSection() {
  const platforms = [
    {
      id: 'web',
      icon: Globe,
      title: 'Web Application',
      subtitle: 'ACCESS VIA BROWSER',
      badge: 'AVAILABLE NOW',
      badgeColor: 'rgba(224, 122, 95, 0.1)',
      badgeTextColor: '#E07A5F',
      linkText: 'Launch App',
      linkHref: '/home',
      isComingSoon: false,
    },
    {
      id: 'desktop',
      icon: Monitor,
      title: 'Desktop Native',
      subtitle: 'MACOS AND WINDOWS',
      badge: 'BETA PREVIEW',
      badgeColor: 'rgba(100, 80, 214, 0.1)',
      badgeTextColor: '#6450d6',
      linkText: 'Join Waitlist',
      linkHref: '#',
      isComingSoon: false,
    },
    {
      id: 'ios',
      icon: Smartphone,
      title: 'iOS App',
      subtitle: 'IPHONE AND IPAD',
      badge: 'IN DEVELOPMENT',
      badgeColor: 'rgba(22, 19, 15, 0.05)',
      badgeTextColor: 'var(--ink-soft)',
      isComingSoon: true,
    },
    {
      id: 'android',
      icon: Tablet,
      title: 'Android App',
      subtitle: 'PHONES AND TABLETS',
      badge: 'PLANNED',
      badgeColor: 'rgba(22, 19, 15, 0.05)',
      badgeTextColor: 'var(--ink-soft)',
      isComingSoon: true,
    },
  ];

  return (
    <section id="downloads" className="relative w-full py-10 bg-transparent overflow-hidden">
      <div className="relative z-10 max-w-[1240px] mx-auto">
        
        {/* Header */}
        <div className="mb-16 md:mb-24 text-center max-w-[800px] mx-auto reveal">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--soouls-accent)]/10 mb-6">
            <Monitor className="w-6 h-6 text-[var(--soouls-accent)]" />
          </div>
          <span className="font-urbanist text-[11px] font-bold text-[var(--soouls-accent)] tracking-[0.3em] uppercase mb-6 block">
            Ecosystem
          </span>
          <h2 className="font-playfair text-4xl sm:text-5xl md:text-7xl font-bold text-[var(--ink)] mb-8">
            Available where <br/> <em className="italic text-[var(--soouls-accent)]">you are</em>
          </h2>
          <p className="font-urbanist text-lg text-[var(--ink-soft)] max-w-xl mx-auto leading-relaxed">
            Your mind isn't tethered to a single device. Neither is Soouls. Access your secure canvas seamlessly across the platforms you use every day.
          </p>
        </div>

        {/* Platform Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full mb-20 md:mb-32">
          {platforms.map((platform, idx) => {
            const Icon = platform.icon;
            return (
              <div
                key={platform.id}
                className={`
                  group relative flex flex-col justify-between p-10 rounded-3xl md:rounded-[3rem] 
                  transition-all duration-700 ease-out overflow-hidden reveal
                  ${platform.isComingSoon 
                    ? 'bg-transparent border border-dashed border-[#e3dbcd] opacity-70 grayscale' 
                    : 'bg-[#fdfaf6]/60 backdrop-blur-md border border-[#e3dbcd]/50 hover:-translate-y-2 hover:bg-white hover:shadow-[0_20px_40px_rgba(217,138,75,0.08)]'}
                  h-[320px]
                `}
                style={{ transitionDelay: `${(idx % 4) * 150}ms` }}
              >
                {/* Glow Effects */}
                {!platform.isComingSoon && (
                  <div className="absolute top-0 right-0 w-40 h-40 bg-[var(--soouls-accent)]/10 blur-[50px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                )}

                <div className="flex flex-col relative z-10">
                  <div className="flex flex-col items-start gap-6 mb-8">
                    <div className={`p-4 rounded-2xl ${platform.isComingSoon ? 'bg-[var(--ink)]/5' : 'bg-[var(--soouls-accent)]/10 text-[var(--soouls-accent)]'} group-hover:scale-110 transition-transform duration-500`}>
                      <Icon className="w-8 h-8" strokeWidth={1.5} />
                    </div>
                    <span
                      className="px-4 py-1.5 rounded-full font-urbanist font-bold text-[10px] tracking-widest"
                      style={{
                        backgroundColor: platform.badgeColor,
                        color: platform.badgeTextColor,
                      }}
                    >
                      {platform.badge}
                    </span>
                  </div>

                  <h3 className="font-playfair text-2xl font-bold text-[var(--ink)] mb-2">
                    {platform.title}
                  </h3>
                  <p className="font-urbanist text-[11px] font-bold text-[var(--ink-soft)] tracking-widest uppercase mb-4">
                    {platform.subtitle}
                  </p>
                </div>

                {!platform.isComingSoon && platform.linkText ? (
                  <a
                    href={platform.linkHref}
                    className="group/link font-urbanist text-[var(--soouls-accent)] font-bold text-sm tracking-widest uppercase flex items-center gap-2 transition-all relative z-10 mt-auto w-max"
                  >
                    {platform.linkText}
                    <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                  </a>
                ) : (
                  <div className="h-4 mt-auto" /> // Spacer
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
