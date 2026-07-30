'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import FloatingOrbs from '../components/FloatingOrbs';
import FooterSection from '../components/FooterSection';
import LandingNavbar from '../components/LandingNavbar';
import RevealObserver from '../components/RevealObserver';

const PLANS = {
  INR: {
    display: '₹199',
    annualDisplay: '₹159',
  },
  USD: {
    display: '$3.99',
    annualDisplay: '$3.19',
  },
} as const;

export default function PricingPage() {
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  useEffect(() => {
    // Read currency cookie on mount to handle geolocation pricing
    const match = document.cookie.match(/(^| )currency=([^;]+)/);
    if (match && match[2] === 'USD') {
      setCurrency('USD');
    } else {
      setCurrency('INR');
    }
  }, []);

  const plan = PLANS[currency];

  return (
    <main
      className="relative min-h-screen font-urbanist selection:bg-[#6450d6]/20"
      style={
        {
          backgroundColor: '#f7f3ec',
          color: '#16130f',
          '--soouls-bg': '#f7f3ec',
          '--soouls-bg-elevated': '#fdfaf6',
          '--soouls-card': '#fdfaf6',
          '--soouls-border': '#e3dbcd',
          '--soouls-text': '#4a4237',
          '--soouls-text-strong': '#16130f',
          '--soouls-text-muted': '#4a4237',
          '--soouls-text-faint': '#928a7c',
          '--soouls-accent': '#d98a4b',
        } as React.CSSProperties
      }
    >
      {/* Background Animated Orbs */}
      <FloatingOrbs />

      {/* Content Layer */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <RevealObserver />
        <LandingNavbar />

        <div className="flex-1 pt-32 pb-20 px-6">
          <div className="max-w-7xl mx-auto text-center mb-16 relative">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--soouls-accent)]/10 text-xs font-bold tracking-widest uppercase text-[var(--soouls-accent)] mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--soouls-accent)]" />
              Simple, honest pricing
            </div>
            <h1 className="text-5xl md:text-[5.5rem] leading-[1.1] font-extrabold tracking-tight mb-6 font-serif text-[var(--soouls-text-strong)]">
              Choose how{' '}
              <span className="italic text-[var(--soouls-accent)] font-normal">deep</span> you want
              <br />
              to go
            </h1>
            <p className="max-w-xl mx-auto text-lg mb-12 text-[var(--soouls-text-muted)]">
              Every plan keeps your entries private and yours. Upgrade only for more depth, never
              for a paywall on your own thoughts.
            </p>

            {/* Monthly / Annual Toggle */}
            <div className="inline-flex items-center p-1 bg-white/50 backdrop-blur-sm rounded-full mb-12 relative shadow-sm border border-[var(--soouls-border)]">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 relative z-10 ${
                  billingCycle === 'monthly'
                    ? 'bg-[var(--soouls-text-strong)] text-white shadow-md'
                    : 'text-[var(--soouls-text-muted)] hover:text-[var(--soouls-text-strong)]'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 relative z-10 flex items-center gap-2 ${
                  billingCycle === 'annual'
                    ? 'bg-[var(--soouls-text-strong)] text-white shadow-md'
                    : 'text-[var(--soouls-text-muted)] hover:text-[var(--soouls-text-strong)]'
                }`}
              >
                Annual
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold ${billingCycle === 'annual' ? 'bg-[var(--soouls-accent)] text-white' : 'bg-orange-100 text-[var(--soouls-accent)]'}`}
                >
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 mb-32 items-stretch text-left">
            {/* Node (Free) */}
            <div className="bg-[var(--soouls-card)] border border-[var(--soouls-border)] rounded-3xl p-8 flex flex-col shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-2xl font-bold text-[var(--soouls-text-strong)]">
                  Node
                </h3>
              </div>
              <p className="text-sm text-[var(--soouls-text-muted)] h-10 mb-6 leading-relaxed">
                For a first, quiet look at how your mind maps.
              </p>
              <div className="mb-8">
                <span className="text-5xl font-extrabold font-serif tracking-tight text-[var(--soouls-text-strong)]">
                  $0
                </span>
                <span className="text-[var(--soouls-text-faint)] text-sm ml-1 font-medium">
                  /mo
                </span>
                <div className="text-[var(--soouls-text-faint)] text-xs mt-1">Free forever</div>
              </div>
              <Link
                href="/sign-up"
                className="w-full py-3.5 rounded-full border border-[var(--soouls-border)] text-[var(--soouls-text-strong)] font-bold text-center hover:bg-black/5 transition-colors mb-8 text-xs tracking-widest uppercase block"
              >
                Start Free
              </Link>
              <ul className="space-y-4 text-sm text-[var(--soouls-text-muted)] mt-auto font-medium">
                <li className="flex items-start gap-3">
                  <span className="text-[var(--soouls-accent)] font-bold">✓</span> Unlimited text
                  entries
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[var(--soouls-accent)] font-bold">✓</span> Spatial Canvas,
                  10 active clusters
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[var(--soouls-accent)] font-bold">✓</span> 7-day River of
                  Time
                </li>
                <li className="flex items-start gap-3 opacity-40">
                  <span className="text-[var(--soouls-text-faint)] font-bold">✓</span>{' '}
                  <span className="line-through">Sunday Review</span>
                </li>
              </ul>
            </div>

            {/* Soul (Premium) */}
            <div className="relative bg-white border-2 border-[var(--soouls-accent)]/30 rounded-3xl p-8 flex flex-col shadow-xl md:scale-105 z-10 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--soouls-accent)]/10 rounded-bl-full -z-10 blur-xl" />

              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--soouls-accent)] text-white text-[10px] font-bold tracking-widest uppercase px-4 py-1.5 rounded-full whitespace-nowrap shadow-md">
                Most souls choose this
              </div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-2xl font-bold text-[var(--soouls-text-strong)]">
                  Soul
                </h3>
                <div className="w-8 h-8 flex items-center justify-center">
                  <span className="text-[var(--soouls-accent)] text-2xl">✦</span>
                </div>
              </div>
              <p className="text-sm text-[var(--soouls-text-muted)] h-10 mb-6 leading-relaxed">
                The full private journaling experience.
              </p>
              <div className="mb-8 flex flex-col">
                <div>
                  <span className="text-5xl font-extrabold font-serif tracking-tight text-[var(--soouls-text-strong)]">
                    {billingCycle === 'annual' ? plan.annualDisplay : plan.display}
                  </span>
                  <span className="text-[var(--soouls-text-faint)] text-sm ml-1 font-medium">
                    /mo
                  </span>
                </div>
                <div className="text-[var(--soouls-text-faint)] text-xs mt-1">
                  {billingCycle === 'annual' ? 'Billed annually' : 'Billed monthly'}
                </div>
              </div>

              <Link
                href="/sign-up"
                className="w-full py-3.5 rounded-full bg-[var(--soouls-accent)] text-white font-bold hover:brightness-110 transition-colors mb-8 shadow-md text-xs tracking-widest uppercase text-center block"
              >
                Sign up to subscribe
              </Link>

              <ul className="space-y-4 text-sm text-[var(--soouls-text-muted)] mt-auto font-medium">
                <li className="flex items-start gap-3">
                  <span className="text-[var(--soouls-accent)] font-bold">✓</span> Everything in
                  Node
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[var(--soouls-accent)] font-bold">✓</span> Advanced AI
                  Weaver
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[var(--soouls-accent)] font-bold">✓</span> Unlimited Thought
                  Clusters
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[var(--soouls-accent)] font-bold">✓</span> Sunday Review
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[var(--soouls-accent)] font-bold">✓</span> Spatial canvas
                  history (River)
                </li>
              </ul>
            </div>
          </div>
        </div>

        <FooterSection />
      </div>
    </main>
  );
}
