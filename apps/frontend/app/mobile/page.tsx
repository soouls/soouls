'use client';

import { motion } from 'framer-motion';
import { Apple, Smartphone } from 'lucide-react';
import Link from 'next/link';
import { FaAndroid, FaApple } from 'react-icons/fa';
import { ButterflyLogo } from '../components/ButterflyLogo';
import FloatingOrbs from '../components/FloatingOrbs';
import FooterSection from '../components/FooterSection';
import LandingNavbar from '../components/LandingNavbar';

export default function MobilePage() {
  return (
    <main
      className="relative min-h-screen font-urbanist selection:bg-[#6450d6]/20 bg-white"
      style={
        {
          '--soouls-bg': '#ffffff',
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
      <FloatingOrbs />

      <div className="relative z-10 flex flex-col min-h-screen text-[var(--soouls-text-strong)]">
        <LandingNavbar />

        <div className="flex-grow pt-32 pb-20 px-6">
          <div className="w-full max-w-5xl mx-auto text-center flex flex-col items-center">
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center max-w-3xl"
            >
              <div className="w-16 h-16 rounded-[1.25rem] bg-[var(--soouls-bg-elevated)] border border-[var(--soouls-border)] shadow-sm flex items-center justify-center mb-8">
                <ButterflyLogo className="w-8 h-8 text-[var(--soouls-text-strong)]" />
              </div>
              <h1 className="font-playfair text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
                Work on the go with the Soouls app.
              </h1>
              <p className="font-urbanist text-xl text-[var(--soouls-text-muted)] mb-10">
                Work without distractions. Available on iOS and Android.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-24 w-full">
                <a
                  href="#"
                  className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 bg-[#16130f] hover:bg-[#2d2822] text-white rounded-md font-urbanist font-semibold active:scale-[0.98] transition-all shadow-sm"
                >
                  <Apple className="w-5 h-5" />
                  For iOS
                </a>
                <a
                  href="#"
                  className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 bg-[var(--soouls-accent)] hover:bg-[#c6793a] text-white rounded-md font-urbanist font-semibold active:scale-[0.98] transition-all shadow-sm"
                >
                  <FaAndroid className="w-5 h-5" />
                  For Android
                </a>
              </div>
            </motion.div>

            {/* App Mockups (3 Phones) */}
            <div className="w-full flex flex-col md:flex-row gap-8 items-center justify-center mb-16">
              {[1, 2, 3].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 + (index * 0.1), ease: [0.16, 1, 0.3, 1] }}
                  className="w-full max-w-[280px] aspect-[9/19] rounded-[2.5rem] border-8 border-gray-900 bg-[var(--soouls-bg-elevated)] shadow-2xl overflow-hidden relative flex flex-col"
                >
                  {/* Fake Notch */}
                  <div className="absolute top-0 inset-x-0 h-6 bg-gray-900 flex justify-center rounded-b-2xl w-32 mx-auto z-20"></div>
                  
                  {/* Fake Content */}
                  <div className="flex-grow p-6 pt-12 flex flex-col items-center justify-center opacity-50">
                    <ButterflyLogo className="w-8 h-8 text-[var(--soouls-text-faint)] mb-4" />
                    <div className="w-3/4 h-2 bg-[var(--soouls-border)] rounded-full mb-3" />
                    <div className="w-full h-2 bg-[var(--soouls-border)] rounded-full mb-3" />
                    <div className="w-2/3 h-2 bg-[var(--soouls-border)] rounded-full mb-10" />
                    
                    <div className="w-full h-32 bg-white rounded-xl border border-[var(--soouls-border)] mb-4" />
                    <div className="w-full h-32 bg-white rounded-xl border border-[var(--soouls-border)]" />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Link to System Requirements */}
            <div className="flex items-center justify-center gap-2 text-sm text-[var(--soouls-text-muted)] mb-32">
              <div className="w-6 h-6 rounded bg-blue-50 text-blue-500 flex items-center justify-center">
                <Smartphone className="w-3 h-3" />
              </div>
              Need to check device compatibility?{' '}
              <a href="#" className="text-blue-500 hover:underline">
                See system requirements →
              </a>
            </div>
          </div>
        </div>

        {/* Cross-platform banner */}
        <div className="w-full bg-[#f7f5f2] py-24 px-6 flex flex-col items-center justify-center text-center">
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-[var(--soouls-text-strong)] mb-8">
            Soouls is also on desktop.
          </h2>
          <Link
            href="/desktop"
            className="inline-flex items-center justify-center px-8 py-3 bg-[var(--soouls-accent)] hover:bg-[#c6793a] text-white rounded-md font-urbanist font-semibold active:scale-[0.98] transition-all shadow-sm"
          >
            Get the desktop app
          </Link>
        </div>

        <FooterSection />
      </div>
    </main>
  );
}
