import type { ComponentType } from 'react';
import FloatingOrbs from '../FloatingOrbs';
import FooterSection from '../FooterSection';
import LandingNavbar from '../LandingNavbar';
import MotionEnhancer from '../MotionEnhancer';
import RevealObserver from '../RevealObserver';

import AboutUsSection from './AboutUsSection';
import BlogSection from './BlogSection';
import CareersSection from './CareersSection';
import CommunitySection from './CommunitySection';
import ContactSection from './ContactSection';
import CookiePolicySection from './CookiePolicySection';
import DocumentationSection from './DocumentationSection';
import DownloadsSection from './DownloadsSection';
import FeaturesSection from './FeaturesSection';
import HelpSection from './HelpSection';
import JournalGuideSection from './JournalGuideSection';
import PrivacyPolicySection from './PrivacyPolicySection';
import ReleaseNotesSection from './ReleaseNotesSection';
import SecuritySection from './SecuritySection';
import TermsOfServiceSection from './TermsOfServiceSection';

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
  privacy: PrivacyPolicySection,
  'terms-of-service': TermsOfServiceSection,
  terms: TermsOfServiceSection,
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
      className="bg-[var(--soouls-bg)] min-h-screen relative overflow-hidden font-urbanist selection:bg-[#6450d6]/20"
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
