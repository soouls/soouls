'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { FiMenu } from 'react-icons/fi';

interface NavLink {
  label: string;
  href: string;
}

interface LandingNavbarProps {
  links?: NavLink[];
}

const defaultLinks: NavLink[] = [
  { label: 'Product', href: '#product' },
  { label: 'Philosophy', href: '#philosophy' },
  { label: 'Sunday Review', href: '#sunday-review' },
  { label: 'Waitlist', href: '#waitlist' },
];

export default function LandingNavbar({ links = defaultLinks }: LandingNavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;

      // Become floating after 60px
      setScrolled(currentY > 60);

      // Hide when scrolling down fast, show when scrolling up
      if (currentY > lastScrollY.current + 8 && currentY > 200) {
        setHidden(true);
      } else if (currentY < lastScrollY.current - 4) {
        setHidden(false);
      }
      lastScrollY.current = currentY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`
        fixed left-1/2 -translate-x-1/2 z-50
        transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]
        flex flex-row items-center
        ${hidden ? '-translate-y-32 opacity-0' : 'translate-y-0 opacity-100'}
      `}
      style={{
        top: scrolled ? '24px' : '66px',
        width: scrolled ? 'min(880px, calc(100vw - 32px))' : 'min(1239px, 100vw)',
        padding: scrolled ? '12px 24px' : '0px 24px',
        borderRadius: scrolled ? '40px' : '0px',
        background: scrolled ? 'rgba(42, 51, 53, 0.75)' : 'transparent',
        backdropFilter: scrolled ? 'blur(32px) saturate(1.2)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(32px) saturate(1.2)' : 'none',
        boxShadow: scrolled
          ? '0px 22px 48px 0px rgba(0, 0, 0, 0.16), 0px 88px 88px 0px rgba(0, 0, 0, 0.14)'
          : 'none',
        border: scrolled ? '1px solid rgba(255,255,255,0.05)' : 'none',
      }}
    >
      <nav className="flex items-center justify-between w-full h-full">
        {/* Left: Mobile Menu + Logo */}
        <div className="flex items-center gap-4 lg:w-[200px]">
          {/* Mobile Menu Icon */}
          <button className="md:hidden text-[#D6C2A3]">
            <FiMenu size={24} />
          </button>

          <span
            className="font-playfair font-bold"
            style={{
              fontFamily: 'ABC Whyte Inktrap, sans-serif',
              color: '#D6C2A3',
              fontSize: scrolled ? '22px' : '28px',
              lineHeight: '1em',
              letterSpacing: '-0.035em',
              transition: 'all 0.5s ease',
            }}
          >
            Soulcanvas
          </span>
        </div>

        {/* Nav Links — centered */}
        <div
          className="hidden md:flex flex-row items-center justify-center flex-1"
          style={{
            gap: scrolled ? '36px' : '48px',
            transition: 'all 0.5s ease',
          }}
        >
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="font-urbanist"
              style={{
                color: scrolled ? '#EFEBDD' : '#A8A8A8',
                fontSize: scrolled ? '16px' : '18px',
                lineHeight: '1.2em',
                transition: 'color 0.2s, font-size 0.5s ease',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.color = '#e07a5f';
                (e.target as HTMLElement).style.textShadow = '0px 0px 8px rgba(224, 122, 95, 0.5)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.color = scrolled ? '#EFEBDD' : '#A8A8A8';
                (e.target as HTMLElement).style.textShadow = 'none';
              }}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* CTA Right */}
        <div className="flex flex-row items-center justify-end gap-3 md:gap-6 lg:w-[200px]">
          <Link
            href="/sign-in"
            className="font-urbanist font-semibold hidden sm:block"
            style={{
              color: '#E07C60',
              fontSize: scrolled ? '15px' : '16px',
              lineHeight: '1em',
              letterSpacing: '-0.035em',
              transition: 'all 0.5s ease',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.color = '#e07a5f';
              (e.target as HTMLElement).style.textShadow = '0px 0px 8px rgba(224, 122, 95, 0.5)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.color = '#E07C60';
              (e.target as HTMLElement).style.textShadow = 'none';
            }}
          >
            Login
          </Link>

          <Link
            href="/sign-in"
            className="font-urbanist font-semibold sm:hidden"
            style={{
              color: '#E07C60',
              fontSize: '14px',
              lineHeight: '1em',
            }}
          >
            Log in
          </Link>

          <Link
            href="/sign-up"
            className="font-urbanist font-semibold transition-all duration-300 flex justify-center items-center"
            style={{
              backgroundColor: '#D17B5B',
              color: '#222222',
              fontSize: scrolled ? '14px' : '15px',
              lineHeight: '1em',
              letterSpacing: '-0.02em',
              padding: scrolled ? '8px 14px' : '10px 16px',
              borderRadius: '10px',
              gap: '6px',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'scale(1.03)';
              (e.currentTarget as HTMLElement).style.backgroundColor = '#262626';
              (e.currentTarget as HTMLElement).style.color = '#D17B5B';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
              (e.currentTarget as HTMLElement).style.backgroundColor = '#D17B5B';
              (e.currentTarget as HTMLElement).style.color = '#222222';
            }}
          >
            Start Writing
          </Link>
        </div>
      </nav>
    </header>
  );
}
