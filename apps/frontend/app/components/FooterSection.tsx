'use client';

import Link from 'next/link';
import { ButterflyLogo } from './ButterflyLogo';
import { ArrowRight, Twitter, Instagram, Linkedin, Mail } from 'lucide-react';

export default function FooterSection() {
  return (
    <footer className="relative z-10 w-full overflow-hidden bg-gradient-to-b from-transparent to-[#fdfaf6]/80 pt-20 md:pt-32 pb-8 border-t border-[var(--line)]">
      {/* Animated Ambient Glow inside Footer */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[500px] bg-[var(--soouls-accent)]/5 rounded-[100%] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#E07A5F]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#6450d6]/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Top Call to Action Area */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-24 pb-16 border-b border-[var(--line)] reveal">
          <div>
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-[var(--ink)] mb-4">
              Begin your <span className="italic text-[var(--soouls-accent)]">journey</span>
            </h2>
            <p className="font-urbanist text-lg text-[var(--ink-soft)] max-w-md">
              A private space for your quietest thoughts. Join thousands of souls exploring their minds.
            </p>
          </div>
          <button className="group relative px-8 py-4 w-full md:w-auto bg-[var(--ink)] text-[#f7f3ec] rounded-full font-urbanist font-bold text-sm tracking-widest uppercase overflow-hidden shadow-[0_10px_30px_rgba(22,19,15,0.15)] transition-transform hover:scale-105 duration-300">
            <span className="relative z-10 flex items-center justify-center gap-2">
              Start free <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--soouls-accent)] to-[#E07A5F] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </button>
        </div>

        {/* Main Footer Links */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-16 lg:gap-24 mb-32">
          
          {/* Brand & Mission */}
          <div className="max-w-sm flex flex-col gap-8 reveal" style={{ transitionDelay: '100ms' }}>
            <Link href="/" className="group flex items-center gap-3 w-fit">
              <div className="w-10 h-10 rounded-full bg-[var(--soouls-accent)]/10 flex items-center justify-center group-hover:bg-[var(--soouls-accent)] transition-colors duration-500">
                <ButterflyLogo className="w-5 h-5 text-[var(--soouls-accent)] group-hover:text-white transition-colors duration-500" />
              </div>
              <span className="font-playfair text-3xl text-[var(--ink)] italic group-hover:opacity-80 transition-opacity">Soouls</span>
            </Link>
            <p className="font-urbanist text-[var(--ink-soft)] text-base leading-relaxed">
              We build tools for introspection, not extraction. Your data is yours, your mind is yours. Welcome to the quietest place on the internet.
            </p>
            
            {/* Social Icons */}
            <div className="flex gap-4 items-center pt-2">
              {[
                { icon: Twitter, href: 'https://x.com/Soouls_in', label: 'X (Twitter)' },
                { icon: Instagram, href: 'https://www.instagram.com/soouls.in/?hl=en', label: 'Instagram' },
                { icon: Linkedin, href: 'https://www.linkedin.com/company/soouls/?viewAsMember=true', label: 'LinkedIn' },
                { icon: Mail, href: 'mailto:hello@soouls.in', label: 'Email' },
              ].map((social, idx) => (
                <a 
                  key={idx}
                  href={social.href} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label={social.label}
                  className="w-10 h-10 rounded-full border border-[var(--line)] flex items-center justify-center text-[var(--ink-faint)] hover:text-[var(--soouls-accent)] hover:border-[var(--soouls-accent)] bg-white/50 hover:bg-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(217,138,75,0.1)]"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Columns */}
          <div className="flex gap-12 md:gap-20 flex-wrap lg:flex-nowrap w-full lg:w-auto justify-between lg:justify-end">
            
            {/* Column 1 */}
            <div className="flex flex-col gap-6 min-w-[140px] reveal" style={{ transitionDelay: '200ms' }}>
              <h4 className="text-[var(--ink)] text-xs uppercase tracking-[0.2em] font-bold mb-2 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--soouls-accent)]" /> Product
              </h4>
              {[
                { name: 'Features', href: '/features' },
                { name: 'Pricing', href: '/pricing' },
                { name: 'Security', href: '/security' },
                { name: 'Changelog', href: '/release-notes' },
              ].map((link) => (
                <Link key={link.name} href={link.href} className="group flex items-center font-urbanist text-sm text-[var(--ink-soft)] transition-colors duration-300 hover:text-[var(--soouls-accent)]">
                  <span className="relative">
                    {link.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-px bg-[var(--soouls-accent)] transition-all duration-300 group-hover:w-full" />
                  </span>
                </Link>
              ))}
            </div>

            {/* Column 2 */}
            <div className="flex flex-col gap-6 min-w-[140px] reveal" style={{ transitionDelay: '300ms' }}>
              <h4 className="text-[var(--ink)] text-xs uppercase tracking-[0.2em] font-bold mb-2 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#E07A5F]" /> Resources
              </h4>
              {[
                { name: 'Journal Guide', href: '/journal-guide' },
                { name: 'Help Center', href: '/help' },
                { name: 'Blog', href: '/blog' },
                { name: 'Community', href: '/community' },
                { name: 'Download App', href: '/downloads' },
              ].map((link) => (
                <Link key={link.name} href={link.href} className="group flex items-center font-urbanist text-sm text-[var(--ink-soft)] transition-colors duration-300 hover:text-[#E07A5F]">
                  <span className="relative">
                    {link.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#E07A5F] transition-all duration-300 group-hover:w-full" />
                  </span>
                </Link>
              ))}
            </div>
            
            {/* Column 3 */}
            <div className="flex flex-col gap-6 min-w-[140px] reveal" style={{ transitionDelay: '400ms' }}>
              <h4 className="text-[var(--ink)] text-xs uppercase tracking-[0.2em] font-bold mb-2 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#6450d6]" /> Company
              </h4>
              {[
                { name: 'About Us', href: '/about' },
                { name: 'Careers', href: '/careers' },
                { name: 'Privacy Policy', href: '/privacy' },
                { name: 'Terms of Service', href: '/terms' },
                { name: 'Contact', href: '/contact' },
              ].map((link) => (
                <Link key={link.name} href={link.href} className="group flex items-center font-urbanist text-sm text-[var(--ink-soft)] transition-colors duration-300 hover:text-[#6450d6]">
                  <span className="relative">
                    {link.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#6450d6] transition-all duration-300 group-hover:w-full" />
                  </span>
                </Link>
              ))}
            </div>

          </div>
        </div>

        {/* Footer Bottom Meta */}
        <div className="border-t border-[var(--line)] pt-8 pb-4 flex flex-col md:flex-row justify-between items-center text-xs text-[var(--ink-faint)] font-urbanist gap-6 reveal" style={{ transitionDelay: '500ms' }}>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> 
            <span className="tracking-wide uppercase">All systems operational</span>
          </div>
          <span className="tracking-wide">© {new Date().getFullYear()} Soouls, Inc. All thoughts remain yours.</span>
          <div className="flex gap-4">
            <span className="hover:text-[var(--ink-soft)] transition-colors cursor-default">Crafted with care</span>
            <span className="hover:text-[var(--ink-soft)] transition-colors cursor-default">For quieter minds</span>
          </div>
        </div>

      </div>

      {/* Giant Clipped Wordmark with Parallax/Fade Effect */}
      <div className="w-full flex justify-center overflow-hidden -mt-10 pointer-events-none select-none z-0 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--soouls-bg)] via-transparent to-transparent z-10" />
        <span className="font-playfair italic font-black text-[var(--soouls-accent)] opacity-[0.03] text-[clamp(8rem,25vw,25rem)] leading-[0.7] tracking-tighter mix-blend-multiply transform translate-y-8">
          Soouls
        </span>
      </div>
    </footer>
  );
}
