'use client';

import { 
  Feather, 
  Layers, 
  WifiOff, 
  EyeOff, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function FeaturesSection() {
  const features = [
    {
      icon: Feather,
      title: 'Lightweight & Minimal',
      short: 'If you can see the stars, you can run Soouls.',
      desc: 'Designed with zero bloat. No complex dashboards, no notification badges, and no loading spinners. Just a vast, empty canvas ready for your thoughts the moment you open it.'
    },
    {
      icon: WifiOff,
      title: 'Local-First Architecture',
      short: 'Write anywhere, even completely offline.',
      desc: 'Your entries are saved instantly to your device. Go completely off the grid and write. Once you reconnect, everything seamlessly syncs to the cloud in the background.'
    },
    {
      icon: EyeOff,
      title: 'Absolute Privacy',
      short: 'End-to-end encrypted. We can\'t read a word.',
      desc: 'The only person with the key to your thoughts is you. We utilize military-grade AES-256 encryption before your entries even leave your device.'
    },
    {
      icon: Layers,
      title: 'Infinite Canvas',
      short: 'Drop a thought anywhere in space.',
      desc: 'Free yourself from the constraints of the page. Double click anywhere to start a node, and draw connections organically as your understanding evolves.'
    }
  ];

  return (
    <section id="features" className="relative w-full py-10 bg-transparent overflow-hidden">
      <div className="relative z-10 max-w-[1240px] mx-auto">
        
        {/* Header */}
        <div className="mb-16 md:mb-24 text-center max-w-[800px] mx-auto reveal">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--soouls-accent)]/10 mb-6">
            <Sparkles className="w-6 h-6 text-[var(--soouls-accent)]" />
          </div>
          <span className="font-urbanist text-[11px] font-bold text-[var(--soouls-accent)] font-semibold tracking-tight mb-6 block">
            Features
          </span>
          <h1 className="font-playfair text-4xl sm:text-5xl md:text-7xl font-bold text-[var(--ink)] leading-tight mb-8">
            Built for <em className="italic text-[var(--soouls-accent)]">focus</em> and reflection
          </h1>
          <p className="font-urbanist text-lg text-[var(--ink-soft)] max-w-xl mx-auto">
            We stripped away everything that demands your attention, leaving only what helps you find it.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20 md:mb-32">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div 
                key={idx} 
                className="group relative bg-[#fdfaf6]/60 backdrop-blur-md border border-[#e3dbcd]/50 rounded-3xl md:rounded-[3rem] p-6 sm:p-8 lg:p-14 transition-colors transition-transform transition-shadow duration-300 hover:bg-white/90 hover:shadow-[0_30px_60px_rgba(217,138,75,0.08)] hover:-translate-y-2 reveal overflow-hidden"
                style={{ transitionDelay: `${(idx % 4) * 100}ms` }}
              >
                {/* Decorative Background Glows */}
                <div className={`absolute -top-32 -right-32 w-64 h-64 rounded-full blur-[80px] opacity-0 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none ${idx % 2 === 0 ? 'bg-[var(--soouls-accent)]' : 'bg-[#6450d6]'}`} />
                <div className={`absolute -bottom-32 -left-32 w-64 h-64 rounded-full blur-[80px] opacity-0 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none ${idx % 2 === 0 ? 'bg-[#E07A5F]' : 'bg-[var(--soouls-accent)]'}`} />
                
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-3xl bg-white border border-[#e3dbcd] shadow-sm flex items-center justify-center mb-10 group-active:scale-95 group-hover:rotate-3 transition-transform duration-300">
                    <Icon size={28} strokeWidth={1.5} className="text-[var(--ink)] group-hover:text-[var(--soouls-accent)] transition-colors duration-300" />
                  </div>
                  
                  <h3 className="font-playfair text-3xl font-bold text-[var(--ink)] mb-4">
                    {feat.title}
                  </h3>
                  
                  <div className="inline-block p-3 bg-[var(--soouls-accent)]/5 rounded-xl border border-[var(--soouls-accent)]/10 mb-6 group-hover:bg-[var(--soouls-accent)]/10 transition-colors duration-300">
                    <p className="font-urbanist text-sm font-bold text-[var(--soouls-accent)] m-0">
                      {feat.short}
                    </p>
                  </div>
                  
                  <p className="font-urbanist text-lg text-[var(--ink-soft)] leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Massive Interactive CTA Block */}
        <div className="max-w-[1000px] mx-auto reveal" style={{ transitionDelay: '300ms' }}>
          <div className="relative bg-gradient-to-br from-[var(--ink)] to-[#2a251e] border border-[#e3dbcd]/20 shadow-[0_20px_60px_rgba(22,19,15,0.3)] rounded-[2rem] md:rounded-[4rem] p-8 sm:p-12 md:p-24 overflow-hidden group">
            
            {/* Ambient glows inside dark card */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--soouls-accent)]/20 rounded-full blur-[100px] opacity-50 group-hover:opacity-80 group-active:scale-95 transition-colors transition-transform transition-shadow duration-500 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#6450d6]/20 rounded-full blur-[100px] opacity-30 group-hover:opacity-60 group-active:scale-95 transition-colors transition-transform transition-shadow duration-500 pointer-events-none" />
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <span className="font-urbanist text-[11px] font-bold text-[#E07A5F] font-semibold tracking-tight mb-6 block">
                Sync Note
              </span>
              <h3 className="font-playfair text-3xl sm:text-4xl md:text-6xl font-bold text-[#f7f3ec] leading-tight mb-8">
                Everything stays with you.<br />
                <span className="italic text-[var(--soouls-accent)]">Seamlessly.</span>
              </h3>
              <p className="font-urbanist text-lg text-[#928a7c] max-w-xl mx-auto mb-12">
                Our local-first architecture ensures that your data is always accessible, even without an internet connection. Real-time sync works quietly in the background.
              </p>
              
              <Link href="/sign-up" className="group/btn relative px-10 py-5 inline-block bg-[var(--soouls-accent)] text-white rounded-full font-urbanist font-bold text-sm font-semibold tracking-tight overflow-hidden shadow-[0_10px_30px_rgba(217,138,75,0.3)] active:scale-[0.97] transition-all duration-200">
                <span className="relative z-10 flex items-center gap-2">
                  Start Writing <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#E07A5F] to-[var(--soouls-accent)] opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
