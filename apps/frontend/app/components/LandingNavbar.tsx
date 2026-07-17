'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ButterflyLogo } from './ButterflyLogo';
import { ThemeToggle } from './ThemeToggle';

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
        className={`fixed left-0 right-0 z-50 transition-all duration-300 ease-out ${
          isVisible ? 'translate-y-0' : '-translate-y-full'
        } ${
          isScrolled 
            ? 'top-0 py-4 bg-[var(--paper-warm)]/70 backdrop-blur-[20px] backdrop-saturate-[180%] shadow-[0_4px_30px_rgba(0,0,0,0.04)] border-b border-black/5 px-10' 
            : 'top-0 py-8 bg-transparent px-10'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex-1 flex justify-start">
            <Link href="/" className="group flex items-center gap-2 text-[var(--soouls-accent)] hover:opacity-80 transition-opacity">
              <ButterflyLogo className="w-5 h-5 transition-transform duration-300 group-hover:rotate-[360deg] group-hover:scale-110" />
              <span className="font-playfair text-2xl text-[var(--soouls-text-strong)] italic">Soouls</span>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center justify-center gap-8 text-sm font-medium text-[var(--soouls-text-muted)]">
            {navLinks.map((link, i) => {
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href!)}
                  className={`hover:text-[#d98a4b] hover:opacity-80 transition-all duration-200 inline-block ${
                    activeSection === link.href
                      ? 'text-[#d98a4b]'
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
            {/* Downloads Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-1 hover:text-[#d98a4b] hover:opacity-80 transition-all duration-200 pb-2 -mb-2">
                Downloads
                <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="bg-[var(--soouls-bg-elevated)] border border-[var(--soouls-border)] rounded-xl shadow-lg p-2 min-w-[200px] flex flex-col gap-1">
                  <Link href="/desktop" className="px-4 py-2 hover:bg-[var(--soouls-accent)]/10 rounded-lg text-left transition-colors flex flex-col group/item">
                    <span className="font-semibold text-[var(--soouls-text-strong)] group-hover/item:text-[var(--soouls-accent)] transition-colors">Mac & Windows</span>
                    <span className="text-xs text-[var(--soouls-text-muted)]">Desktop App</span>
                  </Link>
                  <Link href="/mobile" className="px-4 py-2 hover:bg-[var(--soouls-accent)]/10 rounded-lg text-left transition-colors flex flex-col group/item">
                    <span className="font-semibold text-[var(--soouls-text-strong)] group-hover/item:text-[var(--soouls-accent)] transition-colors">iOS & Android</span>
                    <span className="text-xs text-[var(--soouls-text-muted)]">Mobile App</span>
                  </Link>
                </div>
              </div>
            </div>
          </nav>

          <div className="flex-1 flex items-center justify-end gap-6 text-sm font-medium">
            <ThemeToggle />
            <Link href="/sign-in" className="text-[var(--soouls-text-strong)] hover:text-[#d98a4b] hover:opacity-80 transition-all duration-200 inline-block">Log in</Link>
            <Link href="/sign-up" className={`text-[var(--soouls-bg)] text-sm md:text-base px-4 py-2 md:px-6 md:py-2.5 rounded-full active:scale-[0.97] transition-all duration-200 shadow-sm ${
              isScrolled 
                ? 'bg-[#d98a4b] hover:bg-[#d48142] hover:shadow-[0_8px_30px_rgba(217,138,75,0.3)]' 
                : 'bg-[var(--soouls-text-strong)] hover:opacity-80'
            }`}>Start writing</Link>
          </div>
        </div>
      </header>
    </>
  );
}
