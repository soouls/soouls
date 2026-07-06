import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import LandingNavbar from './components/LandingNavbar';
import FloatingOrbs from './components/FloatingOrbs';
import HeroSection from './components/HeroSection';
import MarqueeSection from './components/MarqueeSection';
import ScrollytellingSection from './components/ScrollytellingSection';
import { HowItWorksSection } from './components/HowItWorksSection';
import { ManifestoSection } from './components/ManifestoSection';
import TestimonialsSection from './components/TestimonialsSection';
import SecondaryMarquee from './components/SecondaryMarquee';
import CTASection from './components/CTASection';
import FooterSection from './components/FooterSection';
import { FeatureShowcaseSection } from './components/FeatureShowcaseSection';
import { PrivacySection } from './components/PrivacySection';
import RevealObserver from './components/RevealObserver';
import MotionEnhancer from './components/MotionEnhancer';

export default async function Home() {
  const { userId } = await auth();
  if (userId) {
    redirect('/home');
  }

  // Force cream-white theme for the landing page exactly like the design
  return (
    <main 
      className="relative min-h-screen font-urbanist selection:bg-[#6450d6]/20"
      style={{
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
      } as React.CSSProperties}
    >
      {/* Background Animated Orbs */}
      <FloatingOrbs />
      
      {/* Content Layer */}
      <div className="relative z-10">
        <RevealObserver />
        <MotionEnhancer />
        <LandingNavbar />
        <HeroSection />
        <MarqueeSection />
        <ScrollytellingSection />
        <FeatureShowcaseSection />
        <HowItWorksSection />
        <PrivacySection />
        <ManifestoSection />
        <TestimonialsSection />
        <SecondaryMarquee />
        <CTASection />
        <FooterSection />
      </div>
    </main>
  );
}
