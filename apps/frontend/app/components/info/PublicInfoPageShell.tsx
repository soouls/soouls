import type { ComponentType } from 'react';
import FooterSection from '../FooterSection';
import LandingNavbar from '../LandingNavbar';
import FloatingOrbs from '../FloatingOrbs';
import RevealObserver from '../RevealObserver';
import MotionEnhancer from '../MotionEnhancer';

import AboutUsSection from './AboutUsSection';
import BlogSection from './BlogSection';
import CareersSection from './CareersSection';
import CommunitySection from './CommunitySection';
import ContactSection from './ContactSection';
import CookiePolicySection from './CookiePolicySection';
import DocumentationSection from './DocumentationSection';
import DownloadsSection from './DownloadsSection';
import FeaturesSection from './FeaturesSection';
import PrivacyPolicySection from './PrivacyPolicySection';
import ReleaseNotesSection from './ReleaseNotesSection';
import SecuritySection from './SecuritySection';
import TermsOfServiceSection from './TermsOfServiceSection';
import HelpSection from './HelpSection';
import JournalGuideSection from './JournalGuideSection';

const publicInfoPageSections: Record<string, ComponentType> = {
  about: AboutUsSection,
  'about-us': AboutUsSection,
  features: FeaturesSection,
  downloads: DownloadsSection,
  'release-notes': ReleaseNotesSection,
  careers: CareersSection,
  contact: ContactSection,
  documentation: DocumentationSection,
  blog: BlogSection,
  community: CommunitySection,
  'privacy-policy': PrivacyPolicySection,
  'privacy': PrivacyPolicySection,
  'terms-of-service': TermsOfServiceSection,
  'terms': TermsOfServiceSection,
  'cookie-policy': CookiePolicySection,
  security: SecuritySection,
  help: HelpSection,
  'journal-guide': JournalGuideSection,
};

export default function PublicInfoPageShell({ slug }: { slug: string }) {
  const Section = publicInfoPageSections[slug];

  if (!Section) {
    return null;
  }

  return (
    <main 
      className="bg-[var(--soouls-bg)] min-h-screen relative overflow-hidden font-urbanist selection:bg-[#6450d6]/20 text-[var(--soouls-text-strong)]"
    >
      <FloatingOrbs />
      <div className="relative z-10 flex flex-col min-h-screen">
        <RevealObserver />
        <MotionEnhancer />
        <LandingNavbar />
        
        {/* Spacer for Fixed Navbar */}
        <div className="h-24 md:h-32" />
        
        {/* Render the section directly so it can expand and use its own layout rules */}
        <div className="flex-grow w-full relative z-10 px-4 md:px-8 mb-20">
          <Section />
        </div>
        
        <FooterSection />
      </div>
    </main>
  );
}
