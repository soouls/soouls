'use client';

import { motion } from 'framer-motion';
import { Smartphone } from 'lucide-react';
import Link from 'next/link';
import { FaWindows, FaApple, FaAndroid } from 'react-icons/fa';
import { ButterflyLogo } from '../components/ButterflyLogo';
import FloatingOrbs from '../components/FloatingOrbs';
import FooterSection from '../components/FooterSection';
import LandingNavbar from '../components/LandingNavbar';
import RevealObserver from '../components/RevealObserver';
import MotionEnhancer from '../components/MotionEnhancer';

const features = [
  {
    title: 'Offline First',
    description: 'Your thoughts are saved locally first. Work without internet, sync when you reconnect.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: 'Deep Focus',
    description: 'A distraction-free environment tailored for writing. Hide the UI and immerse yourself.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
  },
  {
    title: 'Keyboard Shortcuts',
    description: 'Navigate at the speed of thought. Fully operable without ever touching your mouse.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
      </svg>
    ),
  }
];

export default function DesktopPage() {
  return (
    <main className="relative min-h-screen font-urbanist selection:bg-[#6450d6]/20 bg-[var(--soouls-bg)] text-[var(--soouls-text-strong)] overflow-hidden">
      <FloatingOrbs />
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <RevealObserver />
        <MotionEnhancer />
        <LandingNavbar />

        <div className="flex-grow pt-32 pb-20 px-6">
          <div className="w-full max-w-5xl mx-auto text-center flex flex-col items-center">
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center max-w-3xl"
            >
              <div className="w-16 h-16 rounded-[1.25rem] bg-[var(--soouls-bg-elevated)] border border-[var(--soouls-border)] shadow-sm flex items-center justify-center mb-8 reveal">
                <ButterflyLogo className="w-8 h-8 text-[var(--soouls-text-strong)]" />
              </div>
              <h1 className="font-playfair text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6 reveal reveal-delay-1">
                A faster experience on <br />
                <span className="italic text-[var(--soouls-accent)]">Soouls Desktop.</span>
              </h1>
              <p className="font-urbanist text-xl text-[var(--soouls-text-muted)] mb-10 max-w-2xl reveal reveal-delay-2">
                Fast and minimal. Work without distractions, fully integrated with your workflow.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col gap-6 items-center justify-center mb-24 w-full reveal reveal-delay-3">
                <Link
                  href="/home"
                  className="group flex items-center justify-center gap-3 w-full sm:w-auto px-10 py-4 bg-[var(--soouls-text-strong)] hover:opacity-90 text-[var(--soouls-bg)] rounded-full font-urbanist font-semibold active:scale-[0.98] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-lg"
                >
                  Open Web App
                </Link>
                
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full">
                  <div className="relative group flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-[var(--soouls-bg-elevated)] border border-[var(--soouls-border)] text-[var(--soouls-text-muted)] rounded-full font-urbanist font-medium cursor-not-allowed text-sm shadow-sm opacity-80">
                    <FaApple className="w-4 h-4" />
                    <span>Mac App</span>
                    <span className="px-2 py-0.5 bg-[var(--soouls-accent)]/10 text-[var(--soouls-accent)] rounded-full text-[10px] font-bold uppercase tracking-wider ml-1">Coming Soon</span>
                  </div>
                  <div className="relative group flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-[var(--soouls-bg-elevated)] border border-[var(--soouls-border)] text-[var(--soouls-text-muted)] rounded-full font-urbanist font-medium cursor-not-allowed text-sm shadow-sm opacity-80">
                    <FaWindows className="w-4 h-4 text-blue-500/50" />
                    <span>Windows App</span>
                    <span className="px-2 py-0.5 bg-[var(--soouls-accent)]/10 text-[var(--soouls-accent)] rounded-full text-[10px] font-bold uppercase tracking-wider ml-1">Coming Soon</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* App Mockup */}
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="w-full relative rounded-2xl border border-[var(--soouls-border)] bg-[var(--soouls-bg-elevated)] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden aspect-[16/10] md:aspect-[16/9] mb-32 flex items-center justify-center reveal"
            >
              {/* Fake UI Header */}
              <div className="absolute top-0 left-0 w-full h-12 border-b border-[var(--soouls-border)] flex items-center px-4 gap-2 bg-[var(--soouls-bg-elevated)] z-10">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <div className="ml-4 h-5 w-32 bg-[var(--soouls-border)] rounded-md opacity-30"></div>
                <div className="ml-auto h-5 w-5 bg-[var(--soouls-border)] rounded-md opacity-30"></div>
              </div>
              
              {/* Fake App Content */}
              <div className="w-full h-full pt-12 flex">
                {/* Sidebar */}
                <div className="w-64 h-full border-r border-[var(--soouls-border)] p-5 flex flex-col gap-4 bg-[var(--soouls-bg-surface)]">
                  <div className="w-full h-8 bg-[var(--soouls-accent)] rounded-md opacity-10 mb-4" />
                  <div className="w-3/4 h-4 bg-[var(--soouls-border)] rounded-md opacity-20" />
                  <div className="w-1/2 h-4 bg-[var(--soouls-border)] rounded-md opacity-20" />
                  <div className="w-5/6 h-4 bg-[var(--soouls-border)] rounded-md opacity-20" />
                  <div className="w-2/3 h-4 bg-[var(--soouls-border)] rounded-md opacity-20 mt-8" />
                  <div className="w-4/5 h-4 bg-[var(--soouls-border)] rounded-md opacity-20" />
                  
                  <div className="mt-auto w-full h-10 bg-[var(--soouls-border)] rounded-md opacity-20" />
                </div>
                {/* Main Area */}
                <div className="flex-1 h-full p-12 flex flex-col gap-6 items-start bg-[var(--soouls-bg)]">
                  <div className="w-1/2 h-12 bg-[var(--soouls-border)] rounded-lg opacity-20 mb-8" />
                  <div className="w-full h-4 bg-[var(--soouls-border)] rounded-md opacity-10" />
                  <div className="w-full h-4 bg-[var(--soouls-border)] rounded-md opacity-10" />
                  <div className="w-4/5 h-4 bg-[var(--soouls-border)] rounded-md opacity-10" />
                  <div className="w-11/12 h-4 bg-[var(--soouls-border)] rounded-md opacity-10" />
                  <div className="w-3/4 h-4 bg-[var(--soouls-border)] rounded-md opacity-10" />
                  <div className="w-full h-4 bg-[var(--soouls-border)] rounded-md opacity-10 mt-6" />
                  <div className="w-5/6 h-4 bg-[var(--soouls-border)] rounded-md opacity-10" />
                </div>
              </div>
            </motion.div>

            {/* Features Grid */}
            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              {features.map((feature, i) => (
                <div key={i} className="flex flex-col items-center text-center p-8 rounded-2xl border border-[var(--soouls-border)] bg-[var(--soouls-bg-elevated)] hover:shadow-lg transition-shadow reveal" style={{ transitionDelay: `${i * 100}ms` }}>
                  <div className="w-12 h-12 rounded-full bg-[var(--soouls-accent)]/10 text-[var(--soouls-accent)] flex items-center justify-center mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold font-playfair mb-3">{feature.title}</h3>
                  <p className="text-[var(--soouls-text-muted)] leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Premium CTA Section for Mobile App */}
        <section className="py-24 px-6 relative z-10 flex justify-center reveal">
          <div className="bg-[#e6e2f8] relative overflow-hidden w-full max-w-6xl rounded-[2rem] md:rounded-[3rem] py-16 px-6 md:py-28 md:px-8 flex flex-col items-center text-center shadow-sm">
            {/* Peach gradient blur */}
            <div className="absolute -top-20 -right-20 w-[400px] h-[400px] bg-[#fde1d3] rounded-full blur-[80px] opacity-80 pointer-events-none" />

            <span className="text-[#6450d6] text-[10px] font-bold tracking-[0.2em] uppercase mb-8 z-10">Cross-platform</span>

            <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold text-[#16130f] max-w-3xl leading-[1.1] mb-6 tracking-tight z-10">
              Soouls is also available on <em className="font-playfair font-normal italic text-[#6450d6]">mobile</em>
            </h2>

            <p className="text-[#4a4237] text-lg mb-10 z-10 max-w-2xl">
              Write wherever you go. Your entries sync instantly across all devices.
            </p>

            <div className="flex flex-col gap-6 items-center justify-center mb-8 z-10 px-4 sm:px-0">
              <Link href="/home" className="bg-[#16130f] text-[#f7f3ec] px-10 py-4 rounded-full font-medium hover:scale-105 transition-transform shadow-md flex items-center justify-center gap-2 text-lg">
                Open Web App
              </Link>
              
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full">
                <div className="flex items-center justify-center gap-2 px-6 py-3 bg-[#16130f]/5 border border-[#16130f]/10 text-[#4a4237] rounded-full font-medium cursor-not-allowed text-sm opacity-80">
                  <FaApple className="w-4 h-4" />
                  <span>iOS App</span>
                  <span className="px-2 py-0.5 bg-[#16130f]/10 rounded-full text-[10px] font-bold uppercase tracking-wider ml-1">Coming Soon</span>
                </div>
                <div className="flex items-center justify-center gap-2 px-6 py-3 bg-[#16130f]/5 border border-[#16130f]/10 text-[#4a4237] rounded-full font-medium cursor-not-allowed text-sm opacity-80">
                  <FaAndroid className="w-4 h-4 text-[#4a4237]/70" />
                  <span>Android App</span>
                  <span className="px-2 py-0.5 bg-[#16130f]/10 rounded-full text-[10px] font-bold uppercase tracking-wider ml-1">Coming Soon</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <FooterSection />
      </div>
    </main>
  );
}
