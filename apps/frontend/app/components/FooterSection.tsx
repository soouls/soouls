'use client';

import Link from 'next/link';
import { ButterflyLogo } from './ButterflyLogo';

export default function FooterSection() {
  return (
    <footer className="pt-28 overflow-hidden relative z-10 flex flex-col items-center border-t border-[var(--line)]">
      <div className="w-full max-w-7xl mx-auto px-6 mb-24 flex flex-col lg:flex-row justify-between items-start gap-16 lg:gap-24">
        
        {/* Left Side */}
        <div className="max-w-xs flex flex-col gap-6">
          <Link href="/" className="flex items-center gap-2 text-[var(--soouls-accent)] hover:opacity-80 transition-opacity">
            <ButterflyLogo className="w-6 h-6" />
            <span className="font-playfair text-3xl text-[var(--ink)] italic">Soouls</span>
          </Link>
          <p className="text-[var(--ink-soft)] text-sm leading-relaxed">
            A private, non-linear journal where your thoughts become a visual map of your mind. Stop scrolling, start reflecting.
          </p>
          
          {/* Social Icons */}
          <div className="flex gap-4 items-center mt-2">
            <a href="https://x.com/sooulsapp" target="_blank" rel="noopener noreferrer" className="text-[var(--ink-faint)] hover:text-[#d98a4b] transition-all duration-300 hover:-translate-y-1" aria-label="X (Twitter)">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="https://instagram.com/sooulsapp" target="_blank" rel="noopener noreferrer" className="text-[var(--ink-faint)] hover:text-[#d98a4b] transition-all duration-300 hover:-translate-y-1" aria-label="Instagram">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            <a href="https://linkedin.com/company/soouls" target="_blank" rel="noopener noreferrer" className="text-[var(--ink-faint)] hover:text-[#d98a4b] transition-all duration-300 hover:-translate-y-1" aria-label="LinkedIn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
            </a>
            <a href="mailto:hello@soouls.com" className="text-[var(--ink-faint)] hover:text-[#d98a4b] transition-all duration-300 hover:-translate-y-1" aria-label="Email">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            </a>
          </div>
        </div>

        {/* Right Side Columns */}
        <div className="flex gap-12 md:gap-20 flex-wrap lg:flex-nowrap w-full lg:w-auto justify-between lg:justify-end">
          
          <div className="flex flex-col gap-5 min-w-[120px]">
            <h4 className="text-[var(--ink)] text-[11px] uppercase tracking-widest font-bold mb-1">Product</h4>
            <Link href="#features" className="text-sm text-[var(--ink-soft)] hover:text-[#d98a4b] hover:scale-105 transform transition-all duration-300 origin-left inline-block">Features</Link>
            <Link href="#features" className="text-sm text-[var(--ink-soft)] hover:text-[#d98a4b] hover:scale-105 transform transition-all duration-300 origin-left inline-block">Spatial Canvas</Link>
            <Link href="#features" className="text-sm text-[var(--ink-soft)] hover:text-[#d98a4b] hover:scale-105 transform transition-all duration-300 origin-left inline-block">River of Time</Link>
            <Link href="#features" className="text-sm text-[var(--ink-soft)] hover:text-[#d98a4b] hover:scale-105 transform transition-all duration-300 origin-left inline-block">Thought Clusters</Link>
            <Link href="/pricing" className="text-sm text-[var(--ink-soft)] hover:text-[#d98a4b] hover:scale-105 transform transition-all duration-300 origin-left inline-block">Pricing</Link>
            <Link href="/changelog" className="text-sm text-[var(--ink-soft)] hover:text-[#d98a4b] hover:scale-105 transform transition-all duration-300 origin-left inline-block">Changelog</Link>
          </div>

          <div className="flex flex-col gap-5 min-w-[120px]">
            <h4 className="text-[var(--ink)] text-[11px] uppercase tracking-widest font-bold mb-1">Resources</h4>
            <Link href="/help" className="text-sm text-[var(--ink-soft)] hover:text-[#d98a4b] hover:scale-105 transform transition-all duration-300 origin-left inline-block">Help Center</Link>
            <Link href="/guide" className="text-sm text-[var(--ink-soft)] hover:text-[#d98a4b] hover:scale-105 transform transition-all duration-300 origin-left inline-block">Journaling Guide</Link>
            <Link href="/community" className="text-sm text-[var(--ink-soft)] hover:text-[#d98a4b] hover:scale-105 transform transition-all duration-300 origin-left inline-block">Community</Link>
            <Link href="/blog" className="text-sm text-[var(--ink-soft)] hover:text-[#d98a4b] hover:scale-105 transform transition-all duration-300 origin-left inline-block">Blog</Link>
            <Link href="/signup" className="text-sm text-[var(--ink-soft)] hover:text-[#d98a4b] hover:scale-105 transform transition-all duration-300 origin-left inline-block">Download App</Link>
          </div>
          
          <div className="flex flex-col gap-5 min-w-[120px]">
            <h4 className="text-[var(--ink)] text-[11px] uppercase tracking-widest font-bold mb-1">Company</h4>
            <Link href="#founders" className="text-sm text-[var(--ink-soft)] hover:text-[#d98a4b] hover:scale-105 transform transition-all duration-300 origin-left inline-block">About Us</Link>
            <Link href="/careers" className="text-sm text-[var(--ink-soft)] hover:text-[#d98a4b] hover:scale-105 transform transition-all duration-300 origin-left inline-block">Careers</Link>
            <Link href="#privacy" className="text-sm text-[var(--ink-soft)] hover:text-[#d98a4b] hover:scale-105 transform transition-all duration-300 origin-left inline-block">Privacy Policy</Link>
            <Link href="/terms" className="text-sm text-[var(--ink-soft)] hover:text-[#d98a4b] hover:scale-105 transform transition-all duration-300 origin-left inline-block">Terms of Service</Link>
            <a href="mailto:hello@soouls.com" className="text-sm text-[var(--ink-soft)] hover:text-[#d98a4b] hover:scale-105 transform transition-all duration-300 origin-left inline-block">Contact</a>
          </div>

        </div>
      </div>

      {/* Footer Bottom Meta */}
      <div className="w-full max-w-7xl mx-auto px-6 border-t border-[var(--line)] py-6 flex flex-col md:flex-row justify-between items-center text-xs text-[var(--ink-faint)] z-20 gap-4">
        <span>© 2026 Soouls, Inc. All thoughts remain yours.</span>
        <div className="flex gap-6 items-center">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span> Systems Operational
          </span>
          <span>Made for quieter minds.</span>
        </div>
      </div>

      {/* Giant Clipped Wordmark */}
      <div className="w-full flex justify-center overflow-hidden -mt-16 -mb-[2%] pointer-events-none select-none z-10 opacity-60 mix-blend-multiply">
        <span className="font-playfair italic font-medium text-[var(--paper-warm)] text-[clamp(10rem,28vw,30rem)] leading-[0.75] tracking-tight">
          Soouls
        </span>
      </div>
    </footer>
  );
}
