'use client';

import { motion } from 'framer-motion';
import { Shield, Bell, CloudSync } from 'lucide-react';
import Link from 'next/link';
import { FaAndroid, FaApple, FaWindows } from 'react-icons/fa';
import { ButterflyLogo } from '../components/ButterflyLogo';
import FloatingOrbs from '../components/FloatingOrbs';
import FooterSection from '../components/FooterSection';
import LandingNavbar from '../components/LandingNavbar';
import RevealObserver from '../components/RevealObserver';
import MotionEnhancer from '../components/MotionEnhancer';

const features = [
  {
    title: 'Biometrics & Privacy',
    description: 'Lock your journal with FaceID or TouchID. Your quietest thoughts remain completely private.',
    icon: <Shield className="w-6 h-6" />,
  },
  {
    title: 'Daily Check-ins',
    description: 'Gentle, mindful notifications that invite you to pause and reflect on your day.',
    icon: <Bell className="w-6 h-6" />,
  },
  {
    title: 'Seamless Sync',
    description: 'Start writing on your phone and seamlessly continue on your desktop or iPad.',
    icon: <CloudSync className="w-6 h-6" />,
  }
];

export default function MobilePage() {
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
                Your quietest thoughts, <br />
                <span className="italic text-[var(--soouls-accent)]">everywhere you go.</span>
              </h1>
              <p className="font-urbanist text-xl text-[var(--soouls-text-muted)] mb-10 max-w-2xl reveal reveal-delay-2">
                Work without distractions. Beautifully crafted for iOS and Android.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-24 w-full reveal reveal-delay-3">
                <a
                  href="/download/ios"
                  className="group flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 bg-[var(--soouls-text-strong)] hover:opacity-90 text-[var(--soouls-bg)] rounded-full font-urbanist font-semibold active:scale-[0.98] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  <FaApple className="w-6 h-6 transition-transform group-hover:scale-110" />
                  <div className="flex flex-col items-start leading-none">
                    <span className="text-[10px] opacity-70 mb-1">Download on the</span>
                    <span className="text-lg">App Store</span>
                  </div>
                </a>
                <a
                  href="/download/android"
                  className="group flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 bg-[var(--soouls-bg-elevated)] hover:bg-[var(--soouls-border)] border border-[var(--soouls-border)] text-[var(--soouls-text-strong)] rounded-full font-urbanist font-semibold active:scale-[0.98] transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
                >
                  <FaAndroid className="w-6 h-6 transition-transform group-hover:scale-110 text-green-500" />
                  <div className="flex flex-col items-start leading-none">
                    <span className="text-[10px] opacity-70 mb-1">GET IT ON</span>
                    <span className="text-lg">Google Play</span>
                  </div>
                </a>
              </div>
            </motion.div>

            {/* App Mockups (3 Phones) */}
            <div className="w-full flex flex-col md:flex-row gap-6 md:gap-8 items-center justify-center mb-32 perspective-[1000px]">
              {[1, 2, 3].map((item, index) => {
                const isCenter = index === 1;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 100, rotateY: isCenter ? 0 : index === 0 ? 15 : -15 }}
                    animate={{ opacity: 1, y: 0, rotateY: isCenter ? 0 : index === 0 ? 15 : -15 }}
                    whileHover={{ scale: 1.05, rotateY: 0, zIndex: 30 }}
                    transition={{ duration: 1, delay: 0.2 + (index * 0.15), ease: [0.16, 1, 0.3, 1] }}
                    className={`w-full max-w-[280px] aspect-[9/19] rounded-[2.5rem] border-8 border-gray-900 bg-[var(--soouls-bg)] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.4)] overflow-hidden relative flex flex-col transform-gpu transition-all duration-500 ${isCenter ? 'z-20 md:-translate-y-8' : 'z-10'}`}
                  >
                    {/* Fake Notch */}
                    <div className="absolute top-0 inset-x-0 h-6 bg-gray-900 flex justify-center rounded-b-2xl w-32 mx-auto z-20"></div>
                    
                    {/* Fake Content */}
                    <div className="flex-grow p-6 pt-16 flex flex-col items-start opacity-70">
                      <ButterflyLogo className="w-8 h-8 text-[var(--soouls-text-strong)] mb-6 opacity-40 self-center" />
                      
                      {/* Fake Text lines */}
                      <div className="w-3/4 h-5 bg-[var(--soouls-text-strong)] rounded-md opacity-20 mb-4" />
                      <div className="w-full h-3 bg-[var(--soouls-border)] rounded-full mb-3 opacity-50" />
                      <div className="w-full h-3 bg-[var(--soouls-border)] rounded-full mb-3 opacity-50" />
                      <div className="w-5/6 h-3 bg-[var(--soouls-border)] rounded-full mb-8 opacity-50" />
                      
                      {/* Fake Cards */}
                      <div className="w-full h-24 bg-[var(--soouls-bg-elevated)] rounded-xl border border-[var(--soouls-border)] mb-4 p-4 flex flex-col gap-2">
                        <div className="w-1/2 h-3 bg-[var(--soouls-border)] rounded-full" />
                        <div className="w-3/4 h-2 bg-[var(--soouls-border)] rounded-full opacity-50" />
                      </div>
                      <div className="w-full h-24 bg-[var(--soouls-bg-elevated)] rounded-xl border border-[var(--soouls-border)] p-4 flex flex-col gap-2">
                        <div className="w-2/3 h-3 bg-[var(--soouls-border)] rounded-full" />
                        <div className="w-1/2 h-2 bg-[var(--soouls-border)] rounded-full opacity-50" />
                      </div>
                      
                      {/* Fake FAB */}
                      <div className="absolute bottom-6 right-6 w-14 h-14 bg-[var(--soouls-accent)] rounded-full shadow-lg flex items-center justify-center">
                        <div className="w-6 h-6 rounded-full border-2 border-white opacity-80" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

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

        {/* Premium CTA Section for Desktop App */}
        <section className="py-24 px-6 relative z-10 flex justify-center reveal">
          <div className="bg-[#e6e2f8] relative overflow-hidden w-full max-w-6xl rounded-[2rem] md:rounded-[3rem] py-16 px-6 md:py-28 md:px-8 flex flex-col items-center text-center shadow-sm">
            {/* Peach gradient blur */}
            <div className="absolute -top-20 -right-20 w-[400px] h-[400px] bg-[#fde1d3] rounded-full blur-[80px] opacity-80 pointer-events-none" />

            <span className="text-[#6450d6] text-[10px] font-bold tracking-[0.2em] uppercase mb-8 z-10">Cross-platform</span>

            <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold text-[#16130f] max-w-3xl leading-[1.1] mb-6 tracking-tight z-10">
              Soouls is also available on <em className="font-playfair font-normal italic text-[#6450d6]">desktop</em>
            </h2>

            <p className="text-[#4a4237] text-lg mb-10 z-10 max-w-2xl">
              Immersive, distraction-free writing for Mac and Windows.
            </p>

            <div className="flex flex-col w-full sm:w-auto sm:flex-row justify-center gap-4 mb-8 z-10 px-4 sm:px-0">
              <Link href="/download/mac" className="bg-[#16130f] text-[#f7f3ec] px-8 py-4 rounded-full font-medium hover:scale-105 transition-transform shadow-md flex items-center justify-center gap-2">
                <FaApple className="w-5 h-5" />
                Download for Mac
              </Link>
              <Link href="/download/windows" className="bg-transparent border border-[#16130f]/20 text-[#16130f] px-8 py-4 rounded-full font-medium hover:bg-[#16130f]/5 transition-colors shadow-sm flex items-center justify-center gap-2">
                <FaWindows className="w-5 h-5 text-blue-500" />
                Download for Windows
              </Link>
            </div>
          </div>
        </section>

        <FooterSection />
      </div>
    </main>
  );
}
