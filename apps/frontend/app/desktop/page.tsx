'use client';

import { motion } from 'framer-motion';
import { Apple, Smartphone } from 'lucide-react';
import Link from 'next/link';
import { FaWindows } from 'react-icons/fa';
import { ButterflyLogo } from '../components/ButterflyLogo';
import FloatingOrbs from '../components/FloatingOrbs';
import FooterSection from '../components/FooterSection';
import LandingNavbar from '../components/LandingNavbar';

export default function DesktopPage() {
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
                A faster experience on Soouls Desktop.
              </h1>
              <p className="font-urbanist text-xl text-[var(--soouls-text-muted)] mb-10">
                Fast and minimal. Work without distractions.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-24 w-full">
                <a
                  href="#"
                  className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 bg-[var(--soouls-accent)] hover:bg-[#c6793a] text-white rounded-md font-urbanist font-semibold active:scale-[0.98] transition-all shadow-sm"
                >
                  <Apple className="w-5 h-5" />
                  Download for Mac
                </a>
                <a
                  href="#"
                  className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 bg-[var(--soouls-text-strong)] hover:bg-[#2d2822] text-white rounded-md font-urbanist font-semibold active:scale-[0.98] transition-all shadow-sm"
                >
                  <FaWindows className="w-5 h-5" />
                  Download for Windows
                </a>
              </div>
            </motion.div>

            {/* App Mockup */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="w-full relative rounded-xl border border-[var(--soouls-border)] bg-[var(--soouls-bg-elevated)] shadow-2xl overflow-hidden aspect-[16/10] md:aspect-[16/9] mb-16 flex items-center justify-center"
            >
              {/* Fake UI Header */}
              <div className="absolute top-0 left-0 w-full h-12 border-b border-[var(--soouls-border)] flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <p className="text-[var(--soouls-text-faint)] font-urbanist">Soouls Desktop App Interface Placeholder</p>
            </motion.div>

            {/* Link to System Requirements */}
            <div className="flex items-center justify-center gap-2 text-sm text-[var(--soouls-text-muted)] mb-32">
              <div className="w-6 h-6 rounded bg-blue-50 text-blue-500 flex items-center justify-center">
                <FaWindows className="w-3 h-3" />
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
            Soouls is also on mobile.
          </h2>
          <Link
            href="/mobile"
            className="inline-flex items-center justify-center px-8 py-3 bg-[var(--soouls-accent)] hover:bg-[#c6793a] text-white rounded-md font-urbanist font-semibold active:scale-[0.98] transition-all shadow-sm"
          >
            Get the mobile app
          </Link>
        </div>

        <FooterSection />
      </div>
    </main>
  );
}
