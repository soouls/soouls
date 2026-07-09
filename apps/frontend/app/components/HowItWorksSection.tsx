'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function HowItWorksSection() {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (containerRef.current) {
      const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (!isReduced) {
        // Staggered reveal for the steps
        gsap.fromTo(
          gsap.utils.toArray('.hw-step'),
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top 75%',
            }
          }
        );
      }
    }
  }, []);

  return (
    <>
      <style>{`
        .hw-section { padding: 80px 0; background: transparent; overflow: hidden; }
        @media(min-width: 768px) { .hw-section { padding: 140px 0; } }
        .hw-header { margin-bottom: 70px; font-family: 'Fraunces', serif; font-size: 2.5rem; font-weight: 300; color: var(--ink); letter-spacing: -0.02em; }
        .hw-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px; position: relative; }
        
        .hw-step { display: flex; flex-direction: column; position: relative; }
        .hw-top { display: flex; gap: 20px; margin-bottom: 30px; align-items: flex-start; }
        .hw-num { font-family: 'Fraunces', serif; font-size: 3.2rem; font-weight: 300; line-height: 0.8; color: var(--ink-soft); }
        .hw-text h4 { font-weight: 600; font-size: 1rem; color: var(--ink); margin-bottom: 4px; }
        .hw-text p { font-size: 0.85rem; color: var(--ink-faint); line-height: 1.4; max-width: 180px; }
        
        .hw-card { background: #ffffff; border: 1px solid rgba(22,19,15,0.06); border-radius: 24px; padding: 20px; height: 160px; box-shadow: 0 10px 30px rgba(22, 19, 15, .03); display: flex; flex-direction: column; justify-content: center; position: relative; transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.5s ease; cursor: default; }
        .hw-card:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(22, 19, 15, .08); }
        
        .hw-arrow-container { position: absolute; top: 12px; right: -28px; width: 24px; height: 24px; color: var(--ink-faint); display: flex; align-items: center; justify-content: center; z-index: 10; opacity: 0; animation: fadeArrowIn 0.8s ease-out forwards 1s; }
        .hw-svg-arrow { width: 20px; height: 20px; stroke-width: 1.5; animation: slideArrow 2s infinite ease-in-out; }
        
        @keyframes fadeArrowIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideArrow { 0%, 100% { transform: translateX(-3px); } 50% { transform: translateX(3px); } }
        
        /* Step 1 animations */
        .c-brain { font-weight: 600; font-size: .85rem; color: var(--ink); position: absolute; top: 20px; left: 20px; }
        .c-doodle { position: absolute; bottom: 24px; right: 24px; width: 90px; height: auto; }
        .c-doodle path { stroke: var(--ink); stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; fill: none; stroke-dasharray: 200; stroke-dashoffset: 200; animation: drawDoodle 4s ease-in-out infinite alternate; }
        @keyframes drawDoodle { 0%, 15% { stroke-dashoffset: 200; } 85%, 100% { stroke-dashoffset: 0; } }
        
        /* Step 2 animations */
        .c-nodes { position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
        .node-line { position: absolute; background: rgba(217,138,75,.3); height: 1.5px; transform-origin: left center; }
        .nline1 { width: 40px; top: 40%; left: 30%; transform: rotate(-20deg); animation: lineGrow 3s infinite alternate; }
        .nline2 { width: 45px; top: 50%; left: 55%; transform: rotate(35deg); animation: lineGrow 3s infinite alternate 0.5s; }
        .nline3 { width: 35px; top: 60%; left: 25%; transform: rotate(15deg); animation: lineGrow 3s infinite alternate 1s; }
        .node-dot { position: absolute; width: 24px; height: 24px; border-radius: 50%; background: #ffffff; border: 1.5px solid rgba(217,138,75,0.4); display: grid; place-items: center; font-size: 10px; color: var(--amber); box-shadow: 0 4px 10px rgba(0,0,0,0.03); font-weight: 600; }
        .nd1 { top: 20%; left: 25%; animation: floatNode 4s ease-in-out infinite; }
        .nd2 { top: 55%; left: 45%; animation: floatNode 5s ease-in-out infinite 1s; border-color: rgba(207,123,110,0.4); color: var(--rose); }
        .nd3 { top: 35%; right: 20%; animation: floatNode 4.5s ease-in-out infinite 0.5s; border-color: rgba(125,155,118,0.4); color: var(--sage); }
        .nd4 { bottom: 15%; left: 30%; animation: floatNode 6s ease-in-out infinite 1.5s; }
        @keyframes floatNode { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes lineGrow { 0%, 20% { opacity: 0; transform: scaleX(0); } 80%, 100% { opacity: 1; transform: scaleX(1); } }
        
        /* Step 3 animations */
        .c-insight { font-weight: 600; font-size: .9rem; color: var(--ink); margin-bottom: 10px; }
        .c-insight-txt { font-size: .85rem; color: var(--ink-faint); line-height: 1.5; }
        .c-highlight { color: var(--sage); font-weight: 500; background: rgba(125,155,118,.15); padding: 2px 8px; border-radius: 6px; animation: pulseHighlight 3s infinite alternate; white-space: nowrap; }
        @keyframes pulseHighlight { 0%, 20% { background: rgba(125,155,118,.05); color: var(--ink-faint); } 80%, 100% { background: rgba(125,155,118,.2); color: var(--sage); } }
        
        /* Step 4 animations */
        .c-tracker { display: flex; justify-content: space-between; align-items: center; width: 100%; padding: 0 12px; }
        .c-day { display: flex; flex-direction: column; align-items: center; gap: 12px; }
        .c-day span { font-size: 0.65rem; color: var(--ink-faint); font-weight: 600; letter-spacing: 0.05em; }
        .c-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--line); transition: background 0.3s; position: relative; }
        .c-dot.filled { background: var(--amber); box-shadow: 0 0 12px rgba(217,138,75,.4); animation: popDot 4s infinite; }
        .c-day:nth-child(1) .c-dot { animation-delay: 0s; }
        .c-day:nth-child(2) .c-dot { animation-delay: 0.2s; }
        .c-day:nth-child(3) .c-dot { animation-delay: 0.4s; }
        .c-day:nth-child(4) .c-dot { animation-delay: 0.6s; }
        .c-day:nth-child(5) .c-dot { animation-delay: 0.8s; }
        .c-day:nth-child(6) .c-dot { animation-delay: 1.0s; }
        .c-day:nth-child(7) .c-dot { animation-delay: 1.2s; }
        @keyframes popDot { 0%, 85%, 100% { transform: scale(1); opacity: 1; } 92% { transform: scale(1.5); opacity: 0.8; } }

        @media(max-width: 1000px) {
          .hw-grid { grid-template-columns: repeat(2, 1fr); gap: 40px; }
          .hw-step:nth-child(2) .hw-arrow-container { display: none; }
        }
        @media(max-width: 600px) {
          .hw-grid { grid-template-columns: 1fr; }
          .hw-arrow-container { display: none; }
          .hw-header { font-size: 2rem; margin-bottom: 40px; }
        }
      `}</style>

      <section className="hw-section" id="how" ref={containerRef}>
        <div className="wrap">
          <h2 className="hw-header reveal">How Soouls works</h2>

          <div className="hw-grid">

            {/* Step 1 */}
            <div className="hw-step">
              <div className="hw-top">
                <div className="hw-num">01</div>
                <div className="hw-text">
                  <h4>Capture</h4>
                  <p>Write, speak, draw, or add anything.</p>
                </div>
              </div>
              <div className="hw-arrow-container">
                <svg className="hw-svg-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M4 12h16m-6-6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="hw-card">
                <span className="c-brain">Brain dump</span>
                <svg className="c-doodle" viewBox="0 0 100 60">
                  <path d="M10,40 Q30,10 50,30 T80,20 Q90,50 60,40 T30,50" />
                  <path d="M45,20 Q55,10 65,30" strokeDasharray="30" strokeDashoffset="30" style={{ animationDelay: '1s' }} />
                </svg>
              </div>
            </div>

            {/* Step 2 */}
            <div className="hw-step">
              <div className="hw-top">
                <div className="hw-num">02</div>
                <div className="hw-text">
                  <h4>Connect</h4>
                  <p>Soouls maps your thoughts automatically.</p>
                </div>
              </div>
              <div className="hw-arrow-container">
                <svg className="hw-svg-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M4 12h16m-6-6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="hw-card" style={{ padding: 0 }}>
                <div className="c-nodes">
                  <div className="node-line nline1"></div>
                  <div className="node-line nline2"></div>
                  <div className="node-line nline3"></div>
                  <div className="node-dot nd1"></div>
                  <div className="node-dot nd2"></div>
                  <div className="node-dot nd3"></div>
                  <div className="node-dot nd4"></div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="hw-step">
              <div className="hw-top">
                <div className="hw-num">03</div>
                <div className="hw-text">
                  <h4>Understand</h4>
                  <p>AI helps you reflect and gain insight.</p>
                </div>
              </div>
              <div className="hw-arrow-container">
                <svg className="hw-svg-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M4 12h16m-6-6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="hw-card">
                <div className="c-insight">Emotional insight</div>
                <p className="c-insight-txt">You felt <span className="c-highlight">proud and grateful</span> this week.</p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="hw-step">
              <div className="hw-top">
                <div className="hw-num">04</div>
                <div className="hw-text">
                  <h4>Grow</h4>
                  <p>Look back, reflect, and become better.</p>
                </div>
              </div>
              <div className="hw-card">
                <div className="c-tracker">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                    <div className="c-day" key={i}>
                      <span>{day}</span>
                      <div className={`c-dot ${i !== 5 ? 'filled' : ''}`}></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
