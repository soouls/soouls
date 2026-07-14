'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function PrivacySection() {
  const containerRef = useRef<HTMLElement>(null);
  const vaultRef = useRef<HTMLDivElement>(null);
  const lockRef = useRef<SVGSVGElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  
  const [isEncrypted, setIsEncrypted] = useState(true);
  
  const plainText = "Told her the truth today. Hands shaking, voice steady — funny how those can coexist.";
  const cipherText = "x9#kq*d l02~mw 8zj&4 nn0… 7ver# q2@ml pz*81 kd0~s ww3&j 55#a q7… ds@99 v2!z";
  
  const [displayText, setDisplayText] = useState(cipherText);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    if (containerRef.current) {
      const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      if (!isReduced) {
        // Main staggered reveal
        gsap.fromTo(gsap.utils.toArray('.priv-reveal'),
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top 70%',
            }
          }
        );

        // Vault float animation
        gsap.to(vaultRef.current, {
          y: -15,
          duration: 4,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      }
    }
  }, []);

  // Scramble effect
  const toggleEncryption = () => {
    if (isEncrypted) {
      // Decrypting
      setIsEncrypted(false);
      let iteration = 0;
      const interval = setInterval(() => {
        setDisplayText(prev => 
          prev.split('').map((char, index) => {
            if (index < iteration) return plainText[index] || '';
            return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'[Math.floor(Math.random() * 41)];
          }).join('')
        );
        iteration += 2;
        if (iteration >= plainText.length) {
          clearInterval(interval);
          setDisplayText(plainText);
        }
      }, 30);
    } else {
      // Encrypting
      setIsEncrypted(true);
      let iteration = 0;
      const interval = setInterval(() => {
        setDisplayText(prev => 
          prev.split('').map((char, index) => {
            if (index < iteration) return cipherText[index] || '';
            return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'[Math.floor(Math.random() * 41)];
          }).join('')
        );
        iteration += 2;
        if (iteration >= cipherText.length) {
          clearInterval(interval);
          setDisplayText(cipherText);
        }
      }, 30);
    }
  };

  useEffect(() => {
    // Auto toggle encryption every 5 seconds for visual effect
    const timer = setInterval(() => {
      toggleEncryption();
    }, 5000);
    return () => clearInterval(timer);
  }, [isEncrypted]);

  const GreenCheck = () => (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="13" stroke="#7d9b76" strokeWidth="1.5" fill="rgba(125,155,118,0.1)"/>
      <path d="M9 14.5L12.5 18L19 10" stroke="#7d9b76" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  return (
    <>
      <style>{`
        .priv-section { padding: 80px 0; background: transparent; overflow: hidden; position: relative; }
        @media(min-width: 768px) { .priv-section { padding: 140px 0; } }
        
        .priv-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; position: relative; z-index: 2; max-width: 1200px; margin: 0 auto; padding: 0 32px; }
        
        .priv-list { list-style: none; margin-top: 40px; display: flex; flex-direction: column; gap: 16px; }
        .priv-list li { display: flex; gap: 16px; align-items: flex-start; padding: 20px; border: 1px solid var(--line, var(--soouls-border)); border-radius: 16px; background: var(--card, var(--soouls-card)); transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1); cursor: default; }
        .priv-list li:hover { background: rgba(var(--soouls-bg-elevated-rgb), 0.6); border-color: var(--soouls-border); transform: translateX(8px); box-shadow: -8px 12px 30px rgba(0,0,0,0.05); }
        
        .priv-icon { width: 36px; height: 36px; display: grid; place-items: center; flex-shrink: 0; }
        
        .priv-list strong { display: block; font-size: 1.05rem; color: var(--ink, var(--soouls-text-strong)); margin-bottom: 4px; font-weight: 600; }
        .priv-list span { font-size: 0.9rem; color: var(--ink-faint, var(--soouls-text-faint)); line-height: 1.5; display: block; }
        
        .vault-card { position: relative; overflow: hidden; background: rgba(var(--soouls-bg-elevated-rgb), 0.6); backdrop-filter: blur(12px); border: 1px solid var(--soouls-border); border-radius: 32px; padding: 60px 40px; text-align: center; box-shadow: 0 30px 60px rgba(0,0,0,0.05); }
        
        .sonar-rings { position: absolute; top: 110px; left: 50%; transform: translateX(-50%); pointer-events: none; }
        .sonar-ring { position: absolute; left: -50px; top: -50px; width: 100px; height: 100px; border-radius: 50%; border: 1px solid var(--amber, #d98a4b); opacity: 0; animation: sonarPulse 4s cubic-bezier(0.21, 0.53, 0.56, 0.8) infinite; }
        .sonar-ring:nth-child(2) { animation-delay: 1.3s; }
        .sonar-ring:nth-child(3) { animation-delay: 2.6s; }
        @keyframes sonarPulse { 0% { transform: scale(0.5); opacity: 0.8; } 100% { transform: scale(3.5); opacity: 0; } }
        
        .lock-container { width: 90px; height: 100px; margin: 0 auto 24px; position: relative; z-index: 2; cursor: pointer; }
        .lock-svg { width: 100%; height: 100%; filter: drop-shadow(0 10px 20px rgba(217,138,75,0.15)); transition: filter 0.3s; }
        .lock-container:hover .lock-svg { filter: drop-shadow(0 10px 30px rgba(217,138,75,0.3)); }
        
        .lock-shackle { transition: transform 0.5s cubic-bezier(0.68, -0.55, 0.26, 1.55); transform-origin: center 40px; }
        .is-unlocked .lock-shackle { transform: translateY(-12px) rotate(15deg); }
        .lock-body { transition: fill 0.5s; }
        .is-unlocked .lock-body { fill: var(--sage, #7d9b76); }
        .is-unlocked .lock-svg { filter: drop-shadow(0 10px 20px rgba(125,155,118,0.15)); }
        
        .vault-card h3 { font-family: 'Fraunces', serif; font-size: 1.8rem; color: var(--ink, var(--soouls-text-strong)); margin-bottom: 8px; font-weight: 300; }
        .vault-card p.vp { color: var(--ink-faint, var(--soouls-text-faint)); font-size: 0.95rem; }
        
        .enc-demo { position: relative; margin-top: 32px; text-align: left; background: rgba(var(--soouls-bg-elevated-rgb), 0.3); border: 1px solid var(--soouls-border); border-radius: 16px; padding: 24px; font-family: 'SF Mono', 'Roboto Mono', monospace; font-size: 0.9rem; line-height: 1.7; height: 110px; display: flex; align-items: center; cursor: pointer; transition: border-color 0.3s, background 0.3s; }
        .enc-demo:hover { border-color: var(--soouls-border); background: rgba(var(--soouls-bg-elevated-rgb), 0.5); }
        .enc-text { color: var(--sage, #7d9b76); transition: color 0.5s; word-break: break-word; }
        .is-decrypted .enc-text { font-family: 'Inter', sans-serif; color: var(--ink, var(--soouls-text-strong)); }
        
        .priv-stats { display: flex; gap: 16px; margin-top: 40px; }
        .stat-box { flex: 1; text-align: center; border: 1px solid var(--line, var(--soouls-border)); border-radius: 16px; padding: 20px 12px; background: var(--card, var(--soouls-card)); transition: all 0.3s; }
        .stat-box:hover { background: rgba(var(--soouls-bg-elevated-rgb), 0.6); transform: translateY(-4px); border-color: rgba(217,138,75,0.3); }
        .stat-box .num { display: block; font-family: 'Fraunces', serif; font-size: 2rem; color: var(--amber, #d98a4b); line-height: 1; margin-bottom: 6px; }
        .stat-box .label { display: block; font: 600 0.7rem 'Inter', sans-serif; letter-spacing: 0.15em; text-transform: uppercase; color: var(--ink-faint, var(--soouls-text-faint)); }

        @media(max-width: 900px) {
          .priv-grid { grid-template-columns: 1fr; gap: 60px; }
        }
        @media(max-width: 600px) {
          .vault-card { padding: 40px 24px; }
          .priv-stats { flex-direction: column; gap: 12px; }
        }
      `}</style>

      <section className="priv-section" id="privacy" ref={containerRef}>
        <div className="priv-grid">
          
          {/* Left Content */}
          <div>
            <p className="kicker priv-reveal">Private by design</p>
            <h2 className="priv-reveal font-fraunces text-4xl md:text-5xl lg:text-6xl text-[var(--ink)] font-light leading-tight mt-4 mb-6">
              A diary with a lock,<br />not a lobby.
            </h2>
            <p className="priv-reveal text-[var(--ink-soft)] text-lg leading-relaxed max-w-md">
              Honesty needs a safe room. Watch what actually leaves your device — spoiler: nothing readable.
            </p>
            
            <ul className="priv-list">
              <li className="priv-reveal">
                <div className="priv-icon"><GreenCheck /></div>
                <div>
                  <strong>End-to-end encrypted</strong>
                  <span>Entries are sealed on your device. Not even we can read them.</span>
                </div>
              </li>
              <li className="priv-reveal">
                <div className="priv-icon"><GreenCheck /></div>
                <div>
                  <strong>No social layer, ever</strong>
                  <span>No likes, no audience, no pressure. A journal, not a stage.</span>
                </div>
              </li>
              <li className="priv-reveal">
                <div className="priv-icon"><GreenCheck /></div>
                <div>
                  <strong>Your data, your exit</strong>
                  <span>Export everything, anytime, in open formats. Delete means delete.</span>
                </div>
              </li>
              <li className="priv-reveal">
                <div className="priv-icon"><GreenCheck /></div>
                <div>
                  <strong>Insights stay on-device</strong>
                  <span>Emotional patterns are computed locally, for your eyes only.</span>
                </div>
              </li>
            </ul>
            
            <div className="priv-stats priv-reveal">
              <div className="stat-box">
                <span className="num">0</span>
                <span className="label">ads</span>
              </div>
              <div className="stat-box">
                <span className="num">0</span>
                <span className="label">trackers</span>
              </div>
              <div className="stat-box">
                <span className="num">100%</span>
                <span className="label">yours</span>
              </div>
            </div>
          </div>
          
          {/* Right Content - Vault */}
          <div className="vault-card priv-reveal" ref={vaultRef}>
            <div className="sonar-rings" aria-hidden="true">
              <div className="sonar-ring"></div>
              <div className="sonar-ring"></div>
              <div className="sonar-ring"></div>
            </div>
            
            <div 
              className={`lock-container ${!isEncrypted ? 'is-unlocked' : ''}`} 
              onClick={toggleEncryption}
              title="Click to toggle encryption"
            >
              <svg className="lock-svg" viewBox="0 0 74 84" fill="none" ref={lockRef}>
                <path className="lock-shackle" d="M22 38 V26 a15 15 0 0 1 30 0 v12" stroke="#4a4237" strokeWidth="7" strokeLinecap="round" fill="none" />
                <rect className="lock-body" x="12" y="38" width="50" height="42" rx="12" fill="#d98a4b" />
                <circle cx="37" cy="55" r="5" fill="#14110d" />
                <rect x="34.5" y="57" width="5" height="10" rx="2.5" fill="#14110d" />
              </svg>
            </div>
            
            <h3>Only you hold the key</h3>
            <p className="vp">The door locks from the inside. Tap to peek.</p>
            
            <div 
              className={`enc-demo ${!isEncrypted ? 'is-decrypted' : ''}`} 
              onClick={toggleEncryption}
            >
              <p className="enc-text" ref={textRef}>{displayText}</p>
            </div>
            <p className="text-xs text-[var(--ink-faint)] mt-4 tracking-wide uppercase font-semibold">
              <span className="text-[var(--amber)]">you</span> see words · <span className="opacity-70">the wire</span> sees cipher
            </p>
          </div>
          
        </div>
      </section>
    </>
  );
}
