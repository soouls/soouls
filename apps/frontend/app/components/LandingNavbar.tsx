'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { SymbolLogo } from './SymbolLogo';

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
  { label: 'Early Access', href: '/#early-access' },
];

export default function LandingNavbar({ links = defaultLinks }: LandingNavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    <>
      <header
        className={`
          fixed left-1/2 -translate-x-1/2 z-50
          transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]
          flex flex-row items-center
          ${hidden ? '-translate-y-32 opacity-0' : 'translate-y-0 opacity-100'}
        `}
        style={{
          top: scrolled ? '14px' : 'clamp(18px, 4vw, 36px)',
          width: scrolled ? 'min(880px, calc(100% - 24px))' : 'min(1239px, calc(100% - 24px))',
          padding: scrolled ? '12px clamp(12px, 3vw, 32px)' : '12px clamp(12px, 3vw, 24px)',
          borderRadius: scrolled ? '28px' : '22px',
          background: scrolled ? 'rgba(42, 51, 53, 0.75)' : 'rgba(20, 20, 20, 0.15)',
          backdropFilter: 'blur(32px) saturate(1.2)',
          WebkitBackdropFilter: 'blur(32px) saturate(1.2)',
          boxShadow: scrolled
            ? '0px 22px 48px 0px rgba(0, 0, 0, 0.16), 0px 88px 88px 0px rgba(0, 0, 0, 0.14)'
            : 'none',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <nav className="grid w-full grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-2 md:flex md:h-full md:justify-between md:gap-6">
          {/* Mobile menu Button (Left) */}
          <div className="flex md:hidden items-center justify-start">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[#EFEBDD] shadow-[inset_0_1px_0_rgba(255,255,255,.08)] transition-colors hover:bg-white/10"
              aria-label="Open Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Logo */}
          <div className="flex h-[36px] min-w-0 flex-shrink-0 items-center justify-center md:w-[200px] md:justify-start">
            <Link
              href="/#hero"
              aria-label="Go to the Soouls landing page"
              className="relative flex h-full w-full items-center justify-center md:justify-start"
            >
              <span
                className="font-bold"
                style={{
                  fontFamily: 'ABC Whyte Inktrap, sans-serif',
                  color: '#D6C2A3',
                  fontSize: scrolled ? '22px' : 'clamp(22px, 7vw, 28px)',
                  lineHeight: '1em',
                  letterSpacing: '0',
                  opacity: scrolled ? 0 : 1,
                  transform: scrolled ? 'translateX(-12px)' : 'translateX(0)',
                  pointerEvents: scrolled ? 'none' : 'auto',
                  transition: 'all 0.5s ease',
                }}
              >
                Soouls
              </span>
              <div
                className="absolute left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0"
                style={{
                  opacity: scrolled ? 1 : 0,
                  transform: scrolled ? 'rotate(0deg)' : 'translateX(16px) rotate(-90deg)',
                  pointerEvents: scrolled ? 'auto' : 'none',
                  color: '#D6C2A3',
                  transition: 'all 0.5s ease',
                }}
              >
                <SymbolLogo variant="solid" width="32" height="32" />
              </div>
            </Link>
          </div>

          {/* Nav Links — centered */}
          <div
            className="hidden md:flex flex-row items-center justify-center flex-1"
            style={{
              gap: scrolled ? '28px' : '36px',
              transition: 'all 0.5s ease',
            }}
          >
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="font-urbanist font-medium tracking-wide transition-all"
                style={{
                  color: scrolled ? '#EFEBDD' : '#A8A8A8',
                  fontSize: scrolled ? '14px' : '15px',
                  lineHeight: '1.2em',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#E07A5F';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = scrolled ? '#EFEBDD' : '#A8A8A8';
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side — CTA */}
          <div className="flex min-w-0 flex-shrink-0 items-center justify-end md:w-[200px]">
            <Link
              href="/sign-up"
              className="font-urbanist flex items-center justify-center whitespace-nowrap font-semibold transition-all duration-300 hover:scale-105 hover:shadow-[0_0_16px_rgba(224,122,95,0.4)] active:scale-95"
              style={{
                backgroundColor: '#E07A5F',
                color: '#111111',
                padding: 'clamp(9px, 2.6vw, 10px) clamp(12px, 3.2vw, 18px)',
                borderRadius: '9999px',
                fontSize: 'clamp(10px, 2.5vw, 11px)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = '#EFEBDD';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = '#E07A5F';
              }}
            >
              <span className="sm:hidden">Start</span>
              <span className="hidden sm:inline">Start Writing</span>
            </Link>
          </div>
        </nav>
      </header>

      {/* Mobile Drawer menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="w-[85vw] max-w-[360px] h-full bg-[#141111] border-r border-white/5 p-8 flex flex-col justify-between"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-12">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SymbolLogo variant="solid" width="28" height="28" className="text-[#E07A5F]" />
                    <span className="font-playfair font-bold text-xl text-[#EFEBDD]">Soouls</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 text-white/50 hover:text-white rounded-full bg-white/5 border border-white/5"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex flex-col gap-6">
                  {links.map((link, idx) => (
                    <motion.div
                      key={link.label}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-2xl font-light text-[#EFEBDD] hover:text-[#E07A5F] transition-colors block py-2 font-urbanist"
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="h-[1px] bg-white/5 w-full" />
                <Link
                  href="/sign-in"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center text-[#EFEBDD]/60 hover:text-white py-3 text-sm font-urbanist"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center bg-[#E07A5F] hover:bg-[#F08A6F] text-[#111] font-bold py-4 rounded-2xl text-xs tracking-widest uppercase transition-all"
                >
                  Start Writing
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
