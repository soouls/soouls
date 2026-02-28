import LandingNavbar from './components/LandingNavbar';
import HeroSection from './components/HeroSection';
import RiverOfTimeSection from './components/RiverOfTimeSection';
import SpatialCanvasSection from './components/SpatialCanvasSection';
import SundayReviewSection from './components/SundayReviewSection';
import WaitlistSection from './components/WaitlistSection';
import FooterSection from './components/FooterSection';

export default function Home() {
  return (
    <main style={{ backgroundColor: '#222222' }}>
      <LandingNavbar />
      <HeroSection />
      <RiverOfTimeSection />
      <SpatialCanvasSection />
      <SundayReviewSection />
      <WaitlistSection />
      <FooterSection />
    </main>
  );
}
