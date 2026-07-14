import LandingNavbar from '../components/LandingNavbar';
import PricingContent from '../components/PricingContent';
import FooterSection from '../components/FooterSection';
import FloatingOrbs from '../components/FloatingOrbs';
import RevealObserver from '../components/RevealObserver';
import MotionEnhancer from '../components/MotionEnhancer';

export const metadata = {
  title: 'Pricing - Soouls',
  description: 'Choose the right plan for your journey.',
};

export default function PricingPage() {
  return (
    <main className="relative min-h-screen font-urbanist selection:bg-[#6450d6]/20 bg-[var(--soouls-bg)] overflow-hidden">
      <FloatingOrbs />
      <div className="relative z-10">
        <RevealObserver />
        <MotionEnhancer />
        <LandingNavbar />
        <div className="pt-24 min-h-screen relative z-10">
          <PricingContent />
        </div>
        <FooterSection />
      </div>
    </main>
  );
}
