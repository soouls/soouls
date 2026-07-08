'use client';
import { useState } from 'react';
import { Check, X, Sparkles, Infinity as InfinityIcon, Users, ChevronDown } from 'lucide-react';

export default function PricingContent() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const plans = [
    {
      name: 'Node',
      description: 'For a first, quiet look at how your mind maps.',
      priceMonthly: 0,
      priceAnnual: 0,
      icon: <span className="w-8 h-8 rounded-full bg-[#E07A5F]/10 flex items-center justify-center text-[#E07A5F]"><div className="w-2 h-2 rounded-full bg-[#E07A5F]" /></span>,
      features: [
        { text: 'Unlimited text entries', included: true },
        { text: 'Spatial Canvas, 1 active cluster', included: true },
        { text: '7-day River of Time', included: true },
        { text: 'Voice notes & doodles', included: false },
        { text: 'Sunday Review', included: false },
      ],
      cta: 'Start free',
      highlighted: false,
    },
    {
      name: 'Soul',
      description: 'The full private journaling experience.',
      priceMonthly: 9,
      priceAnnual: 7.20,
      icon: <Sparkles className="text-[var(--soouls-accent)] w-6 h-6" />,
      features: [
        { text: 'Everything in Node', included: true },
        { text: 'Voice notes & doodles', included: true },
        { text: 'Unlimited Thought Clusters', included: true },
        { text: 'Sunday Review', included: true },
        { text: 'Synced across every device', included: true },
      ],
      cta: 'Start 14 days free',
      highlighted: true,
      badge: 'Most souls choose this',
    },
    {
      name: 'Universe',
      description: 'For minds that want the deepest read.',
      priceMonthly: 19,
      priceAnnual: 15.20,
      icon: <InfinityIcon className="text-[#6450d6] w-6 h-6" />,
      features: [
        { text: 'Everything in Soul', included: true },
        { text: 'Deep emotional pattern analysis', included: true },
        { text: 'Full-history River of Time', included: true },
        { text: 'Priority insight processing', included: true },
        { text: 'Early access to new features', included: true },
      ],
      cta: 'Go deeper',
      highlighted: false,
    },
    {
      name: 'Centrum',
      description: 'For teams, therapists, and shared practices.',
      priceMonthly: 'Custom',
      priceAnnual: 'Custom',
      icon: <Users className="text-[var(--ink)] w-6 h-6" />,
      features: [
        { text: 'Everything in Universe', included: true },
        { text: 'Multi-seat billing', included: true },
        { text: 'Shared reflection prompts', included: true },
        { text: 'Dedicated onboarding & support', included: true },
        { text: 'Admin controls, zero data-selling', included: true },
      ],
      cta: 'Talk to us',
      highlighted: false,
    }
  ];

  const faqs = [
    {
      q: 'Is there really a free plan, forever?',
      a: "Yes — Node is free with no time limit and no credit card required. It's a real, usable version of Soouls, not a crippled trial."
    },
    {
      q: 'What happens to my entries if I downgrade?',
      a: "Nothing is deleted. You'll simply lose access to the features tied to the higher tier — like Sunday Review or unlimited clusters — but every entry you've written stays readable and exportable."
    },
    {
      q: 'Can I switch between monthly and annual later?',
      a: "Yes, anytime from Settings → Billing. Switching to annual applies the discount immediately; switching to monthly takes effect at your next renewal."
    },
    {
      q: 'Do you offer a student or therapist discount?',
      a: "Yes — students get 40% off Soul with a valid student email, and therapists using Soouls with clients should reach out about Centrum's per-seat rates."
    },
    {
      q: 'Is my data ever used to train AI models?',
      a: "No, on any plan, ever. Insight generation runs on your entries to serve you, not to train anything, and is never sold or shared."
    }
  ];

  return (
    <div className="w-full relative z-10 pt-10 pb-32">
      
      {/* HERO HEADER */}
      <div className="max-w-4xl mx-auto px-6 text-center mb-16 reveal">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--line)] bg-[#fdfaf6]/50 backdrop-blur-md mb-8">
          <div className="w-2 h-2 rounded-full bg-[var(--soouls-accent)] animate-pulse" />
          <span className="font-urbanist text-[11px] uppercase tracking-[0.2em] font-bold text-[var(--ink-soft)]">Simple, honest pricing</span>
        </div>
        <h1 className="font-playfair text-5xl md:text-7xl font-bold text-[var(--ink)] leading-tight mb-6">
          Choose how <span className="italic text-[var(--soouls-accent)]">deep</span> you want to go
        </h1>
        <p className="font-urbanist text-lg text-[var(--ink-soft)] max-w-2xl mx-auto mb-12">
          Every plan keeps your entries private and yours. Upgrade only for more depth, never for a paywall on your own thoughts.
        </p>

        {/* BILLING TOGGLE */}
        <div className="inline-flex items-center p-1.5 bg-[#fdfaf6]/80 backdrop-blur-xl border border-[var(--line)] rounded-full relative">
          <div 
            className="absolute top-1.5 bottom-1.5 rounded-full bg-[var(--ink)] transition-all duration-300 ease-out"
            style={{ 
              left: isAnnual ? '50%' : '6px', 
              width: 'calc(50% - 6px)' 
            }} 
          />
          <button 
            className={`relative z-10 px-6 py-2.5 rounded-full font-urbanist font-bold text-sm transition-colors duration-300 ${!isAnnual ? 'text-[#f7f3ec]' : 'text-[var(--ink-soft)]'}`}
            onClick={() => setIsAnnual(false)}
          >
            Monthly
          </button>
          <button 
            className={`relative z-10 px-6 py-2.5 rounded-full font-urbanist font-bold text-sm transition-colors duration-300 flex items-center gap-2 ${isAnnual ? 'text-[#f7f3ec]' : 'text-[var(--ink-soft)]'}`}
            onClick={() => setIsAnnual(true)}
          >
            Annual
            <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${isAnnual ? 'bg-[#f7f3ec]/20 text-white' : 'bg-[#E07A5F]/10 text-[#E07A5F]'}`}>
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* PRICING GRID */}
      <div className="max-w-7xl mx-auto px-6 mb-32 reveal">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, i) => (
            <div 
              key={plan.name} 
              className={`relative flex flex-col bg-[#fdfaf6]/80 backdrop-blur-3xl rounded-[2rem] p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(217,138,75,0.08)] ${
                plan.highlighted 
                  ? 'border-2 border-[var(--soouls-accent)] shadow-[0_10px_30px_rgba(217,138,75,0.15)] scale-105 z-10' 
                  : 'border border-[#e3dbcd]/60'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[var(--soouls-accent)] text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full whitespace-nowrap">
                  {plan.badge}
                </div>
              )}
              
              <div className="mb-6 flex items-center justify-between">
                <h3 className="font-playfair text-2xl font-bold text-[var(--ink)]">{plan.name}</h3>
                {plan.icon}
              </div>
              
              <p className="font-urbanist text-sm text-[var(--ink-soft)] min-h-[40px] mb-6">
                {plan.description}
              </p>
              
              <div className="mb-2">
                <span className="font-urbanist text-3xl font-bold text-[var(--ink)]">
                  {typeof plan.priceMonthly === 'number' ? '$' : ''}
                  {isAnnual ? plan.priceAnnual : plan.priceMonthly}
                </span>
                {typeof plan.priceMonthly === 'number' && (
                  <span className="font-urbanist text-[var(--ink-faint)] ml-1">/mo</span>
                )}
              </div>
              
              <p className="font-urbanist text-xs text-[var(--ink-faint)] min-h-[20px] mb-8">
                {typeof plan.priceMonthly === 'number' ? (isAnnual ? 'Billed annually' : 'Billed monthly') : 'Priced per seat'}
              </p>
              
              <button className={`w-full py-4 rounded-full font-urbanist font-bold text-sm tracking-widest uppercase transition-colors duration-300 mb-8 ${
                plan.highlighted 
                  ? 'bg-[var(--soouls-accent)] text-white hover:bg-[#c27a41]' 
                  : 'bg-[var(--ink)]/5 text-[var(--ink)] hover:bg-[var(--ink)]/10'
              }`}>
                {plan.cta}
              </button>
              
              <div className="flex flex-col gap-4 mt-auto">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    {feature.included ? (
                      <Check className="w-4 h-4 text-[var(--soouls-accent)] mt-0.5 shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-[var(--ink-faint)] opacity-50 mt-0.5 shrink-0" />
                    )}
                    <span className={`font-urbanist text-sm leading-snug ${feature.included ? 'text-[var(--ink-soft)]' : 'text-[var(--ink-faint)] opacity-60'}`}>
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TRUST STRIP */}
      <div className="border-y border-[var(--line)] bg-[#fdfaf6]/40 backdrop-blur-md py-16 mb-32 reveal">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div>
            <div className="w-12 h-12 mx-auto mb-6 rounded-full bg-[var(--soouls-accent)]/10 flex items-center justify-center text-[var(--soouls-accent)]">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <h4 className="font-playfair text-xl font-bold text-[var(--ink)] mb-3">Cancel anytime</h4>
            <p className="font-urbanist text-sm text-[var(--ink-soft)] max-w-xs mx-auto">No contracts, no retention calls. Downgrade in two clicks from Settings.</p>
          </div>
          <div>
            <div className="w-12 h-12 mx-auto mb-6 rounded-full bg-[var(--soouls-accent)]/10 flex items-center justify-center text-[var(--soouls-accent)]">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <h4 className="font-playfair text-xl font-bold text-[var(--ink)] mb-3">Entries stay yours</h4>
            <p className="font-urbanist text-sm text-[var(--ink-soft)] max-w-xs mx-auto">Downgrade and your past entries stay intact and exportable — nothing gets held hostage.</p>
          </div>
          <div>
            <div className="w-12 h-12 mx-auto mb-6 rounded-full bg-[var(--soouls-accent)]/10 flex items-center justify-center text-[var(--soouls-accent)]">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <h4 className="font-playfair text-xl font-bold text-[var(--ink)] mb-3">14-day money back</h4>
            <p className="font-urbanist text-sm text-[var(--ink-soft)] max-w-xs mx-auto">Try Soul or Universe fully. Not for you? Full refund, no questions asked.</p>
          </div>
        </div>
      </div>

      {/* FAQ SECTION */}
      <div className="max-w-3xl mx-auto px-6 mb-32 reveal">
        <div className="text-center mb-16">
          <span className="font-urbanist text-[11px] uppercase tracking-[0.2em] font-bold text-[var(--soouls-accent)] mb-4 block">Questions</span>
          <h2 className="font-playfair text-4xl font-bold text-[var(--ink)]">Before you decide</h2>
        </div>
        
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-[#fdfaf6]/80 backdrop-blur-xl border border-[var(--line)] rounded-2xl overflow-hidden transition-colors hover:bg-white/80">
              <button 
                onClick={() => toggleFaq(idx)}
                className="w-full px-6 py-6 flex items-center justify-between text-left focus:outline-none"
              >
                <span className="font-playfair text-xl font-bold text-[var(--ink)] pr-4">{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-[var(--soouls-accent)] shrink-0 transition-transform duration-300 ${openFaq === idx ? 'rotate-180' : ''}`} />
              </button>
              <div 
                className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${openFaq === idx ? 'max-h-40 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <p className="font-urbanist text-[var(--ink-soft)] leading-relaxed">
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FINAL CTA */}
      <div className="max-w-5xl mx-auto px-6 reveal">
        <div className="bg-gradient-to-br from-[#fdfaf6]/80 to-[#fdfaf6]/40 backdrop-blur-3xl border border-[#e3dbcd]/60 shadow-[0_8px_32px_rgba(217,138,75,0.06)] rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-[#E07A5F]/10 rounded-full blur-3xl pointer-events-none" />
          
          <Sparkles className="w-12 h-12 text-[var(--soouls-accent)] mx-auto mb-8 animate-pulse" />
          <h3 className="font-playfair text-4xl md:text-5xl font-bold text-[var(--ink)] mb-6">
            Not sure which one? <span className="italic text-[var(--soouls-accent)]">Start with Node.</span>
          </h3>
          <p className="font-urbanist text-lg text-[var(--ink-soft)] mb-10 max-w-xl mx-auto">
            You can always go deeper later — nothing you write today gets left behind.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="px-8 py-4 bg-[var(--ink)] text-[#f7f3ec] rounded-full font-urbanist font-bold text-sm tracking-widest uppercase hover:bg-black transition-colors">
              Start free with Node
            </button>
            <button className="px-8 py-4 bg-transparent border border-[var(--ink)] text-[var(--ink)] rounded-full font-urbanist font-bold text-sm tracking-widest uppercase hover:bg-[var(--ink)]/5 transition-colors">
              Compare plans again ↑
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
