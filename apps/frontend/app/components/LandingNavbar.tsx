'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ButterflyLogo } from './ButterflyLogo';

const navLinks = [
  { href: '#features', label: 'Features' },
  { href: '#how', label: 'How it works' },
  { href: '/pricing', label: 'Pricing' },
  { href: '#testimonials', label: 'Testimonials' },
];

export default function LandingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 50);

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);

      // Detect active section
      const sections = ['features', 'how', 'testimonials'];
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]!);
        if (el && el.getBoundingClientRect().top <= 200) {
          setActiveSection('#' + sections[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleNavClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    if (href.startsWith('#')) {
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      window.location.href = href;
    }
  }, []);

  return (
    <>
      <header 
        className={`fixed left-0 right-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.22,0.8,0.28,1)] ${
          isVisible ? 'translate-y-0' : '-translate-y-full'
        } ${
          isScrolled 
            ? 'top-0 py-4 bg-[var(--paper-warm)]/85 backdrop-blur-xl shadow-[0_8px_30px_rgba(22,19,15,0.06)] border-b border-[var(--line)] px-10' 
            : 'top-0 py-8 bg-transparent px-10'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-2 text-[var(--soouls-accent)] hover:opacity-80 transition-opacity">
            <ButterflyLogo className="w-5 h-5 transition-transform duration-500 group-hover:rotate-[360deg] group-hover:scale-110" />
            <span className="font-playfair text-2xl text-[var(--soouls-text-strong)] italic">Soouls</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--soouls-text-muted)]">
            {navLinks.map((link, i) => {
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href!)}
                  className={`hover:text-[#d98a4b] hover:scale-105 transform transition-all duration-300 origin-left inline-block ${
                    activeSection === link.href
                      ? 'text-[#d98a4b] scale-105'
                      : ''
                  }`}
                >
                  {link.label}
                  {activeSection === link.href && (
                    <span className="block h-[2px] mt-0.5 bg-gradient-to-r from-[#d98a4b] to-[#cf7b6e] rounded-full animate-[scaleIn_0.3s_ease-out]" />
                  )}
                </a>
              );
            })}
          </nav>

          <div className="flex items-center gap-6 text-sm font-medium">
            <Link href="/sign-in" className="text-[var(--soouls-text-strong)] hover:text-[#d98a4b] hover:scale-105 transform transition-all duration-300 origin-left inline-block">Log in</Link>
            <Link href="/sign-up" className={`text-[var(--soouls-bg)] text-sm md:text-base px-4 py-2 md:px-6 md:py-2.5 rounded-full hover:scale-105 transition-all duration-300 shadow-sm ${
              isScrolled 
                ? 'bg-[#d98a4b] hover:shadow-[0_8px_30px_rgba(217,138,75,0.3)]' 
                : 'bg-[var(--soouls-text-strong)]'
            }`}>Start writing</Link>
          </div>
        </div>
      </header>
    </>
  );
}
