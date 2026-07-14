'use client';

import Link from 'next/link';

interface NavLink {
  label: string;
  href: string;
}

interface LandingNavbarProps {
  links?: NavLink[];
}

const defaultLinks: NavLink[] = [
  { label: 'Product', href: '/#product' },
  { label: 'Philosophy', href: '/#philosophy' },
  { label: 'Sunday Review', href: '/#sunday-review' },
  { label: 'Waitlist', href: '/#waitlist' },
];

export default function LandingDock({ links = defaultLinks }: LandingNavbarProps) {
  return (
    <div
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-row items-center rounded-[32px]"
      style={{
        backgroundColor: 'rgba(42, 51, 53, 0.7)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0px 22px 48px 0px rgba(0, 0, 0, 0.16), 0px 8px 16px 0px rgba(0, 0, 0, 0.1)',
        padding: '16px 32px',
        gap: '48px',
      }}
    >
      {/* Logo Area */}
      <div className="flex items-center gap-1">
        <Link href="/#hero" aria-label="Go to the Soouls landing page">
          <span
            className="font-playfair font-bold"
            style={{
              fontFamily: 'ABC Whyte Inktrap, sans-serif',
              color: '#D6C2A3',
              fontSize: '28px', // Scaled down from 44px for practical web usage
              lineHeight: '1em',
              letterSpacing: '-0.035em',
            }}
          >
            Soouls
          </span>
        </Link>
      </div>

      {/* Nav Links */}
      <nav className="hidden md:flex flex-row gap-[40px] items-center">
        {links.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="font-urbanist text-[18px] text-[#A8A8A8] hover:text-[#EFEBDD] transition-colors duration-200"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Call To Actions */}
      <div className="flex flex-row items-center">
        <Link
          href="/#waitlist"
          className="font-urbanist font-semibold bg-[#E07C60] hover:bg-[#d4694e] text-[#222222] text-[16px] tracking-tight px-5 py-3 rounded-[12px] active:scale-[0.97] transition-all duration-200 flex justify-center items-center"
        >
          Join the Waitlist
        </Link>
      </div>
    </div>
  );
}
