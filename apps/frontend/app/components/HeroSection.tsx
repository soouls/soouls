'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import Link from 'next/link';
import MindMapCanvas from './MindMapCanvas';

export default function HeroSection() {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReduced) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Staggered entrance sequence
      tl.fromTo('.hero-pill', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, delay: 0.2 })
        .fromTo('.hero-line-1', { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9 }, '-=0.4')
        .fromTo('.hero-line-2', { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9 }, '-=0.5')
        .fromTo('.hero-swash path', { strokeDashoffset: 320 }, { strokeDashoffset: 0, duration: 1, ease: 'power2.inOut' }, '-=0.6')
        .fromTo('.hero-sub', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, '-=0.5')
        .fromTo('.hero-cta-btn', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.12 }, '-=0.4')
        .fromTo('.hero-trust', { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, '-=0.3')
        .fromTo('.hero-stats-bar', { y: 20, opacity: 0, scale: 0.95 }, { y: 0, opacity: 1, scale: 1, duration: 0.7 }, '-=0.3')
        .fromTo('.chip-f', { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, stagger: 0.15, ease: 'back.out(2)' }, '-=0.5')
        .fromTo('.hero-deco', { scale: 0, opacity: 0 }, { scale: 1, opacity: 0.6, duration: 0.5, stagger: 0.1, ease: 'back.out(3)' }, '-=0.6')
        .fromTo('.scroll-hint', { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.2');

      // Continuous floating for decorative elements
      gsap.utils.toArray('.hero-deco').forEach((el, i) => {
        gsap.to(el as HTMLElement, {
          y: `random(-20, 20)`,
          x: `random(-15, 15)`,
          rotation: `random(-8, 8)`,
          duration: `random(4, 7)`,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 0.5,
        });
      });

      // Subtle breathing for the hero title
      gsap.to('.hero-line-2 em', {
        backgroundPosition: '100% 0',
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative pt-28 md:pt-40 pb-20 px-6 w-full text-center z-10 min-h-screen flex flex-col justify-center items-center overflow-hidden">
      
      {/* Background Mindmap Canvas */}
      <MindMapCanvas />

      <style>{`
        .hero-pill {
          display: inline-flex; align-items: center; gap: 8px; font-size: 0.78rem; font-weight: 600;
          letter-spacing: 0.08em; text-transform: uppercase; color: var(--soouls-text-strong);
          background: rgba(var(--soouls-bg-elevated-rgb), 0.7); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
          border: 1px solid var(--soouls-border); border-radius: 999px; padding: 10px 22px; margin-bottom: 34px;
          position: relative; overflow: hidden;
        }
        .hero-pill .dot {
          width: 7px; height: 7px; border-radius: 50%; background: #d98a4b;
          animation: pulse 2.4s infinite;
        }
        .hero-pill::after {
          content: ''; position: absolute; top: 0; left: -100%; width: 60%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(var(--soouls-accent-rgb), 0.12), transparent);
          animation: pillShimmer 4s ease-in-out infinite;
        }
        @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.5); opacity: 0.5; } }
        @keyframes pillShimmer { 0%, 100% { left: -100%; } 50% { left: 150%; } }

        .hero-title em {
          font-style: italic; font-weight: 400;
          background: linear-gradient(100deg, #d98a4b 20%, #cf7b6e 45%, #d98a4b 70%);
          background-size: 220% 100%; -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-swash { display: block; margin: -10px auto 12px; overflow: visible; }
        .hero-swash path { stroke-dasharray: 320; stroke-dashoffset: 0; }

        .chip-f {
          position: absolute; z-index: 2; background: rgba(var(--soouls-bg-elevated-rgb), 0.88); backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid var(--soouls-border); border-radius: 18px; padding: 14px 18px;
          box-shadow: 0 16px 40px rgba(22, 19, 15, 0.07); display: flex; align-items: center; gap: 10px;
          font-size: 0.85rem; font-weight: 500; color: var(--soouls-text-strong); will-change: transform;
          animation: floaty 7s ease-in-out infinite;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          cursor: default;
        }
        .chip-f:hover { transform: scale(0.98) !important; box-shadow: 0 8px 20px rgba(22, 19, 15, 0.05); }
        .chip-f .em { font-size: 1.2rem; }
        .chip-f small { display: block; color: var(--soouls-text-faint); font-size: 0.73rem; font-weight: 400; }
        .cf1 { top: 22%; left: 6%; animation-delay: 0.4s; }
        .cf2 { top: 14%; right: 7%; animation-delay: 1.3s; }
        .cf3 { bottom: 24%; left: 9%; animation-delay: 2.1s; }
        .cf4 { bottom: 28%; right: 8%; animation-delay: 0.9s; }
        .cf5 { top: 48%; left: 3%; animation-delay: 1.8s; }
        .cf6 { top: 42%; right: 4%; animation-delay: 0.6s; }
        @keyframes floaty { 0%, 100% { transform: translateY(0) rotate(-1deg); } 50% { transform: translateY(-14px) rotate(1.4deg); } }
        
        .chip-f .wave { display: flex; align-items: flex-end; gap: 3px; height: 18px; }
        .chip-f .wave b { width: 3px; border-radius: 2px; background: linear-gradient(180deg, #cf7b6e, #d98a4b); animation: wv 1.2s ease-in-out infinite; }
        .chip-f .wave b:nth-child(odd) { animation-delay: 0.15s; } .chip-f .wave b:nth-child(3n) { animation-delay: 0.3s; }
        @keyframes wv { 0%, 100% { height: 22%; } 50% { height: 100%; } }
        
        /* Mood mini bar chart */
        .mood-bars { display: flex; align-items: flex-end; gap: 2px; height: 24px; }
        .mood-bars i { width: 4px; border-radius: 3px; display: block; animation: mbar 3s ease-in-out infinite; }
        .mood-bars i:nth-child(1) { height: 40%; background: #e5c39a; }
        .mood-bars i:nth-child(2) { height: 70%; background: #d98a4b; animation-delay: 0.3s; }
        .mood-bars i:nth-child(3) { height: 55%; background: #cf7b6e; animation-delay: 0.6s; }
        .mood-bars i:nth-child(4) { height: 85%; background: #7d9b76; animation-delay: 0.9s; }
        .mood-bars i:nth-child(5) { height: 60%; background: #6d7fa3; animation-delay: 1.2s; }
        @keyframes mbar { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(1.3); } }

        /* Decorative floating elements */
        .hero-deco {
          position: absolute; z-index: 1; pointer-events: none; opacity: 0.6;
        }

        @media(max-width: 900px) { .chip-f, .hero-deco { display: none; } }

        .scroll-hint {
          position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%); z-index: 2;
          font-size: 0.78rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--soouls-text-faint);
          animation: drift 2.6s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .scroll-hint svg { display: inline-block; margin-left: 6px; animation: arrowDown 2s ease-in-out infinite; }
        @keyframes arrowDown { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(5px); } }
        @keyframes drift { 0%, 100% { transform: translate(-50%, 0); } 50% { transform: translate(-50%, 8px); } }

        .hero-stats-bar {
          display: flex; align-items: center; gap: 28px; margin-top: 32px; padding: 16px 32px;
          background: rgba(var(--soouls-bg-elevated-rgb), 0.6); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--soouls-border); border-radius: 999px;
        }
        .hero-stat { display: flex; align-items: center; gap: 8px; font-size: 0.82rem; color: var(--ink-soft); }
        .hero-stat strong { font-family: 'Fraunces', serif; font-size: 1.15rem; color: var(--ink); font-weight: 500; }
        .hero-stat-divider { width: 1px; height: 24px; background: var(--line); }

        @media (max-width: 640px) {
          .hero-stats-bar { flex-direction: column; gap: 16px; border-radius: 24px; padding: 24px; }
          .hero-stat-divider { width: 100%; height: 1px; }
        }
      `}</style>

      {/* Decorative floating shapes */}
      <div className="hero-deco" style={{ top: '12%', left: '18%' }}>
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="5" fill="#d98a4b" opacity="0.35"/><circle cx="14" cy="14" r="13" stroke="#d98a4b" strokeWidth="1" opacity="0.15"/></svg>
      </div>
      <div className="hero-deco" style={{ top: '30%', right: '15%' }}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="3" width="14" height="14" rx="4" stroke="#7d9b76" strokeWidth="1.5" opacity="0.3" transform="rotate(15 10 10)"/></svg>
      </div>
      <div className="hero-deco" style={{ bottom: '35%', left: '20%' }}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><polygon points="9,1 17,13 1,13" stroke="#cf7b6e" strokeWidth="1.2" opacity="0.25" fill="none"/></svg>
      </div>
      <div className="hero-deco" style={{ top: '55%', right: '18%' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" stroke="#6d7fa3" strokeWidth="1" opacity="0.2" fill="none"/></svg>
      </div>
      <div className="hero-deco" style={{ bottom: '18%', right: '22%' }}>
        <svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="3" fill="#7d9b76" opacity="0.2"/></svg>
      </div>
      <div className="hero-deco" style={{ top: '20%', left: '35%' }}>
        <svg width="6" height="6" viewBox="0 0 6 6"><circle cx="3" cy="3" r="3" fill="#d98a4b" opacity="0.4"/></svg>
      </div>
      <div className="hero-deco" style={{ top: '65%', left: '28%' }}>
        <svg width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" fill="#cf7b6e" opacity="0.25"/></svg>
      </div>
      <div className="hero-deco" style={{ bottom: '40%', right: '30%' }}>
        <svg width="10" height="10" viewBox="0 0 10 10"><rect x="1" y="1" width="8" height="8" rx="2" fill="#6d7fa3" opacity="0.15"/></svg>
      </div>

      {/* Floating Chips */}
      <div className="chip-f cf1" aria-hidden="true">
        <span className="em">🎙️</span>
        <div className="text-left">Voice note<small>3am thought · 0:42</small></div>
        <span className="wave"><b></b><b></b><b></b><b></b><b></b></span>
      </div>
      <div className="chip-f cf2" aria-hidden="true">
        <span className="em">🌗</span>
        <div className="text-left">Inner weather<small>mostly light this week</small></div>
        <div className="mood-bars"><i></i><i></i><i></i><i></i><i></i></div>
      </div>
      <div className="chip-f cf3" aria-hidden="true">
        <span className="em">✏️</span>
        <div className="text-left">Doodle<small>garden plan v2</small></div>
      </div>
      <div className="chip-f cf4" aria-hidden="true">
        <span className="em">🕸️</span>
        <div className="text-left">New cluster<small>"the studio dream"</small></div>
      </div>
      <div className="chip-f cf5" aria-hidden="true">
        <span className="em">📸</span>
        <div className="text-left">Memory<small>coffee with dad</small></div>
      </div>
      <div className="chip-f cf6" aria-hidden="true">
        <span className="em">💭</span>
        <div className="text-left">Thought<small>linked to 3 entries</small></div>
      </div>

      <div className="hero-inner max-w-4xl relative z-10 flex flex-col items-center">
        <div className="hero-pill"><span className="dot"></span> Private · Non-linear · Yours</div>
        
        <h1 className="hero-title font-fraunces text-5xl sm:text-6xl md:text-[5.5rem] font-light tracking-tight mb-2 text-[var(--soouls-text-strong)] leading-[1.08]">
          <span className="hero-line-1 inline-block">Your thoughts,</span><br />
          <span className="hero-line-2 inline-block"><em>finally on a map.</em></span>
        </h1>
        
        <svg className="hero-swash" width="250" height="22" viewBox="0 0 250 22" fill="none" aria-hidden="true">
          <path d="M6 14 C 60 4, 120 20, 172 10 S 232 6, 244 12" stroke="#d98a4b" strokeWidth="3" strokeLinecap="round"/>
        </svg>
        
        <p className="hero-sub text-lg md:text-xl text-[var(--soouls-text-muted)] max-w-2xl mx-auto leading-relaxed mt-4 mb-10">
          Soouls is a private, non-linear journal where writing, voice notes, images, doodles and tasks connect into a living map of your mind — one quiet space to think, feel and reflect.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-5 justify-center">
          <Link href="/sign-up" className="hero-cta-btn group relative px-8 py-3.5 rounded-full font-semibold text-[15px] tracking-tight bg-[var(--ink)] text-[var(--paper)] transition-all active:scale-[0.97] duration-200">
            <span className="relative z-10">Begin your map — it&apos;s free</span>
          </Link>
          <Link href="/dashboard" className="hero-cta-btn group px-8 py-3.5 rounded-full font-semibold text-[15px] tracking-tight border border-[var(--soouls-border)] hover:bg-[var(--soouls-border)]/50 transition-all active:scale-[0.97] duration-200 relative overflow-hidden">
            <span className="relative z-10">Peek inside</span>
          </Link>
        </div>
        
        <p className="hero-trust mt-6 text-sm text-[var(--soouls-text-faint)] font-medium tracking-wide">No feeds. No followers. No noise. Just you.</p>

        {/* Social proof stats bar */}
        <div className="hero-stats-bar">
          <div className="hero-stat">
            <strong>12k+</strong>
            <span>quiet minds</span>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat">
            <strong>4.9</strong>
            <span className="flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#d98a4b"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              rating
            </span>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat">
            <strong>2M+</strong>
            <span>entries written</span>
          </div>
        </div>
      </div>

      <div className="scroll-hint">
        Scroll to wander 
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
      </div>
    </section>
  );
}
