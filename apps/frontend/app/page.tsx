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

  return (
    <main 
      className="relative min-h-screen font-urbanist selection:bg-[#6450d6]/20 bg-[var(--soouls-bg)] text-[var(--soouls-text-strong)]"
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
