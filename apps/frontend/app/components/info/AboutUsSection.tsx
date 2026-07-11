'use client';

import { 
  LockIcon, 
  MoonIcon, 
  GitMergeIcon,
  Heart
} from 'lucide-react';

export default function AboutUsSection() {
  return (
    <section className="relative w-full py-10 bg-transparent overflow-hidden">
      <div className="relative z-10 max-w-[1000px] mx-auto">
        
        {/* Hero */}
        <div className="mb-16 md:mb-24 text-center max-w-[800px] mx-auto reveal">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#E07A5F]/10 mb-6">
            <Heart className="w-6 h-6 text-[#E07A5F]" />
          </div>
          <span className="font-urbanist text-[11px] font-bold text-[#E07A5F] font-semibold tracking-tight mb-6 block">
            Our story
          </span>
          <h1 className="font-playfair text-4xl sm:text-5xl md:text-6xl font-bold text-[var(--ink)] leading-tight mb-8">
            Built by people who couldn't <em className="italic text-[#E07A5F]">find this</em> anywhere else
          </h1>
          <p className="font-urbanist text-lg text-[var(--ink-soft)] max-w-xl mx-auto">
            Soouls started as the tool two overwhelmed minds needed for themselves, before it was ever meant to be a company.
          </p>
        </div>

        {/* Letter */}
        <div className="relative bg-[#fdfaf6]/60 backdrop-blur-md border border-[#e3dbcd]/50 rounded-3xl md:rounded-[3rem] p-6 sm:p-8 md:p-16 mb-20 md:mb-32 max-w-[800px] mx-auto reveal overflow-hidden group shadow-[0_10px_30px_rgba(224,122,95,0.05)] hover:shadow-[0_20px_40px_rgba(224,122,95,0.08)] transition-colors transition-transform transition-shadow duration-300">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#E07A5F]/10 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[var(--soouls-accent)]/10 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          
          <div className="relative z-10 prose prose-lg md:prose-xl font-urbanist text-[var(--ink-soft)] prose-p:leading-relaxed mx-auto">
            <p>We kept losing ourselves in productivity apps built for output — streaks, dashboards, guilt. Our thoughts deserved better than a to-do list with a diary bolted on.</p>
            <p>So we built the thing we needed: a room with no audience, where a voice note at 3am and a doodle on a napkin matter as much as a perfect paragraph. Where a life doesn't have to be linear to make sense.</p>
            <p className="text-[var(--ink)] font-medium">Soouls is our love letter to the wandering mind. We hope it becomes yours.</p>
            <p className="mt-12 font-playfair italic text-[#E07A5F] text-2xl">— the Soouls team</p>
          </div>
        </div>

        {/* Values */}
        <div className="mb-20 md:mb-32">
          <div className="text-center mb-16 reveal">
            <span className="font-urbanist text-[11px] font-bold text-[#E07A5F] font-semibold tracking-tight mb-4 block">
              What we won't compromise on
            </span>
            <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--ink)]">
              The rules we built around
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: LockIcon, title: 'Private by default', desc: 'End-to-end encrypted, never sold, never used to train anything. Not a policy that can quietly change later — an architecture decision.' },
              { icon: MoonIcon, title: 'Quiet, not addictive', desc: "No streak-shaming, no infinite scroll, no push notification designed to make you anxious. If you leave for a month, we're just glad you're back." },
              { icon: GitMergeIcon, title: 'Non-linear on purpose', desc: "Your mind doesn't file itself into folders and dates. We built the product around how thinking actually happens, not how filing cabinets work." },
            ].map((val, idx) => {
              const Icon = val.icon;
              return (
                <div key={idx} className="group relative bg-[#fdfaf6]/60 backdrop-blur-md border border-[#e3dbcd]/50 rounded-3xl md:rounded-[2.5rem] p-10 transition-colors transition-transform transition-shadow duration-300 hover:bg-white/90 hover:shadow-[0_20px_40px_rgba(224,122,95,0.08)] hover:-translate-y-2 reveal overflow-hidden" style={{ transitionDelay: `${idx * 100}ms` }}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#E07A5F]/10 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  
                  <div className="relative z-10 w-16 h-16 rounded-2xl bg-white border border-[#e3dbcd] shadow-sm flex items-center justify-center mb-8 group-active:scale-95 transition-transform duration-300">
                    <Icon size={28} strokeWidth={1.5} className="text-[#E07A5F]" />
                  </div>
                  <h4 className="relative z-10 font-playfair text-2xl font-bold text-[var(--ink)] mb-4">{val.title}</h4>
                  <p className="relative z-10 font-urbanist text-[var(--ink-soft)] leading-relaxed">
                    {val.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-20 md:mb-32 max-w-[800px] mx-auto">
          <div className="text-center mb-20 reveal">
            <span className="font-urbanist text-[11px] font-bold text-[#E07A5F] font-semibold tracking-tight mb-4 block">
              How we got here
            </span>
            <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--ink)]">
              A short, honest timeline
            </h2>
          </div>
          
          <div className="relative space-y-8 md:space-y-0 before:absolute before:inset-0 before:ml-[23px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-px before:bg-gradient-to-b before:from-transparent before:via-[#e3dbcd] before:to-transparent">
            
            {[
              { time: 'Early days', title: "A notes app that wouldn't stay organized", desc: 'The first version was a personal tool — scattered notes that refused to fit into folders, which turned out to be the point.' },
              { time: 'First map', title: 'The Spatial Canvas idea', desc: 'Instead of forcing entries into a list, we let them sit in space — and the shape of the canvas became the insight itself.' },
              { time: 'Early access', title: 'Sunday Review & first users', desc: 'A handful of overthinkers, night writers, and one very patient therapist started using it weekly. Most of the product\'s honesty came from listening to them.' },
              { time: 'Today', title: '10,000+ people mapping their minds', desc: 'Grown without ad spend, one quiet recommendation at a time.' }
            ].map((item, idx) => (
              <div key={idx} className="relative flex items-start md:justify-between md:odd:flex-row-reverse group reveal" style={{ transitionDelay: `${idx * 150}ms` }}>
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white border border-[#e3dbcd] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 group-active:scale-95 group-hover:border-[#E07A5F] transition-colors transition-transform transition-shadow duration-300">
                  <div className="w-3 h-3 rounded-full bg-[#E07A5F] group-hover:animate-ping" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-8 rounded-2xl md:rounded-[2rem] bg-[#fdfaf6]/60 backdrop-blur-md border border-[#e3dbcd]/50 ml-4 md:ml-0 md:group-odd:text-right hover:bg-white hover:shadow-lg transition-all active:scale-[0.98] duration-200">
                  <span className="font-urbanist text-[11px] font-bold text-[#E07A5F] font-semibold tracking-tight mb-3 block">{item.time}</span>
                  <h5 className="font-playfair text-2xl font-bold text-[var(--ink)] mb-3">{item.title}</h5>
                  <p className="font-urbanist text-[var(--ink-soft)] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
            
          </div>
        </div>

        {/* Team */}
        <div className="mb-20 md:mb-32">
          <div className="text-center mb-16 reveal">
            <span className="font-urbanist text-[11px] font-bold text-[#E07A5F] font-semibold tracking-tight mb-4 block">
              Who's building it
            </span>
            <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--ink)]">
              A deliberately small team
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { img: '12', role: 'Founder', desc: 'Product & engineering' },
              { img: '47', role: 'Design lead', desc: 'Brand & interface' },
              { img: '33', role: 'Engineer', desc: 'Spatial Canvas & sync' },
              { img: '25', role: 'Engineer', desc: 'Insights & clustering' },
            ].map((member, idx) => (
              <div key={idx} className="text-center group reveal" style={{ transitionDelay: `${idx * 100}ms` }}>
                <div className="w-full aspect-square rounded-2xl md:rounded-[2rem] bg-[#fdfaf6] border border-[#e3dbcd]/50 overflow-hidden mb-6 relative shadow-sm">
                  <img src={`https://i.pravatar.cc/300?img=${member.img}`} alt={member.role} className="w-full h-full object-cover transition-transform duration-300 group-active:scale-95 opacity-90 group-hover:opacity-100" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink)]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <h5 className="font-playfair text-xl font-bold text-[var(--ink)] mb-1">{member.role}</h5>
                <p className="font-urbanist text-sm text-[var(--ink-soft)]">{member.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="max-w-[800px] mx-auto text-center reveal" style={{ transitionDelay: '300ms' }}>
          <div className="relative bg-gradient-to-br from-[#fdfaf6]/80 to-[#fdfaf6]/40 backdrop-blur-3xl border border-[#e3dbcd]/60 shadow-[0_8px_32px_rgba(224,122,95,0.06)] rounded-3xl md:rounded-[3rem] p-8 sm:p-12 md:p-20 overflow-hidden">
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#E07A5F]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <h3 className="font-playfair text-4xl font-bold text-[var(--ink)] mb-4">
                Curious what we're <em className="italic text-[#E07A5F]">building next</em>?
              </h3>
              <p className="font-urbanist text-lg text-[var(--ink-soft)] mb-10 max-w-md mx-auto">
                We post honestly about what's working and what isn't. No roadmap theater.
              </p>
              <a href="/blog" className="inline-block px-10 py-4 bg-[var(--ink)] text-[#f7f3ec] rounded-full font-urbanist font-bold text-sm font-semibold tracking-tight active:scale-[0.97] transition-all duration-200">
                Read the blog
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
