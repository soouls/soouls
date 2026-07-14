'use client';

import type React from 'react';
import { useEffect, useRef, useState } from 'react';

export function FeatureShowcaseSection() {
  const [activeTab, setActiveTab] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const tabs = [
    { no: '01', title: 'Write', desc: 'pages that branch, not scroll', icon: '✍️' },
    { no: '02', title: 'Speak', desc: 'voice becomes memory', icon: '🎙️' },
    { no: '03', title: 'Doodle', desc: 'ink for the unsayable', icon: '✏️' },
    { no: '04', title: 'Collect', desc: 'photos, tickets, textures', icon: '🖼️' },
    { no: '05', title: 'Intend', desc: 'gentle tasks, zero guilt', icon: '☑️' },
    { no: '06', title: 'Reflect', desc: 'your week, mirrored back', icon: '💌' },
  ];

  const tints = [
    'rgba(217,138,75,.14)',
    'rgba(207,123,110,.14)',
    'rgba(125,155,118,.16)',
    'rgba(109,127,163,.14)',
    'rgba(217,138,75,.12)',
    'rgba(207,123,110,.12)',
  ];

  useEffect(() => {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setReducedMotion(isReduced);

    const startTimer = () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (!isReduced) {
        timerRef.current = setInterval(() => {
          setActiveTab((prev) => (prev + 1) % tabs.length);
        }, 5000);
      }
    };

    startTimer();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setActiveTab((prev) => (prev + 1) % tabs.length);
        startTimer();
      } else if (e.key === 'ArrowLeft') {
        setActiveTab((prev) => (prev + tabs.length - 1) % tabs.length);
        startTimer();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [tabs.length]);

  const handleTabClick = (index: number) => {
    setActiveTab(index);
    if (timerRef.current) clearInterval(timerRef.current);
    if (!reducedMotion) {
      timerRef.current = setInterval(() => {
        setActiveTab((prev) => (prev + 1) % tabs.length);
      }, 5000);
    }
  };

  const handleMouseEnter = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleMouseLeave = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!reducedMotion) {
      timerRef.current = setInterval(() => {
        setActiveTab((prev) => (prev + 1) % tabs.length);
      }, 5000);
    }
  };

  // Typed text effect
  const [typedText, setTypedText] = useState('');
  useEffect(() => {
    const fullText =
      'Told her the truth today. Hands shaking, voice steady \u2014 funny how those can coexist\u2026';
    if (reducedMotion) {
      setTypedText(fullText);
      return;
    }

    let currentIndex = 0;
    let typeTimeout: NodeJS.Timeout;

    const typeChar = () => {
      setTypedText(fullText.slice(0, currentIndex++));
      if (currentIndex <= fullText.length) {
        typeTimeout = setTimeout(typeChar, 45);
      } else {
        typeTimeout = setTimeout(() => {
          currentIndex = 0;
          typeChar();
        }, 5200);
      }
    };

    typeChar();

    return () => {
      if (typeTimeout) clearTimeout(typeTimeout);
    };
  }, [reducedMotion]);

  // Interactive doodle pad
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const pad = canvasRef.current;
    const wrap = wrapRef.current;
    if (!pad || !wrap) return;

    const pc = pad.getContext('2d');
    if (!pc) return;

    const pdpr = Math.min(window.devicePixelRatio || 1, 2);
    let drawing = false;
    let lx = 0;
    let ly = 0;

    const prs = () => {
      pad.width = pad.offsetWidth * pdpr;
      pad.height = pad.offsetHeight * pdpr;
      pc.setTransform(pdpr, 0, 0, pdpr, 0, 0);
      pc.lineCap = 'round';
      pc.lineJoin = 'round';
      pc.strokeStyle = '#7d9b76';
      pc.lineWidth = 2.6;
    };

    const pos = (e: PointerEvent) => {
      const r = pad.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };

    const handlePointerDown = (e: PointerEvent) => {
      drawing = true;
      wrap.classList.add('used');
      const p = pos(e);
      lx = p.x;
      ly = p.y;
      pad.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!drawing) return;
      const p = pos(e);
      pc.beginPath();
      pc.moveTo(lx, ly);
      pc.lineTo(p.x, p.y);
      pc.stroke();
      lx = p.x;
      ly = p.y;
    };

    const handlePointerUp = () => {
      drawing = false;
    };

    pad.addEventListener('pointerdown', handlePointerDown);
    pad.addEventListener('pointermove', handlePointerMove);
    pad.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('resize', prs);

    prs();

    return () => {
      pad.removeEventListener('pointerdown', handlePointerDown);
      pad.removeEventListener('pointermove', handlePointerMove);
      pad.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('resize', prs);
    };
  }, []);

  const clearPad = () => {
    const pad = canvasRef.current;
    const wrap = wrapRef.current;
    if (!pad || !wrap) return;
    const pc = pad.getContext('2d');
    if (pc) {
      pc.clearRect(0, 0, pad.offsetWidth, pad.offsetHeight);
      wrap.classList.remove('used');
    }
  };

  return (
    <>
      <style>{`
        /* ===== features ===== */
        .showcase { display: grid; grid-template-columns: 330px 1fr; gap: 20px; margin-top: 56px; }
        .show-list { display: flex; flex-direction: column; gap: 10px; }
        .show-tab { position: relative; display: flex; gap: 14px; align-items: center; text-align: left; padding: 16px 18px; border: 1px solid var(--line); border-radius: 16px; background: var(--card); cursor: pointer; font-family: 'Inter', sans-serif; transition: all .4s var(--ease); overflow: hidden; }
        .show-tab .tno { font-family: 'Fraunces', serif; font-style: italic; color: var(--ink-faint); font-size: 1rem; transition: color .4s; }
        .show-tab strong { display: block; font-size: .95rem; color: var(--ink); }
        .show-tab small { color: var(--ink-faint); font-size: .76rem; }
        .show-tab:active { transform: scale(0.98); }
        .show-tab.active { background: var(--ink); border-color: var(--ink); box-shadow: 0 12px 30px rgba(22, 19, 15, .2); }
        .show-tab.active strong { color: var(--paper); }
        .show-tab.active small { color: rgba(247, 243, 236, .55); }
        .show-tab.active .tno { color: var(--amber); }
        .tbar { position: absolute; left: 0; bottom: 0; height: 2.5px; width: 100%; }
        .show-tab.active .tbar::after { content: ''; display: block; height: 100%; background: linear-gradient(90deg, var(--amber), var(--rose)); width: 0; animation: tprog 5s linear forwards; }
        @keyframes tprog { to { width: 100%; } }
        .show-stage { position: relative; min-height: 430px; background: var(--card); border: 1px solid var(--line); border-radius: 26px; overflow: hidden; }
        .show-stage::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse 80% 70% at 50% 30%, var(--stagec, rgba(217,138,75,.12)), transparent 70%); transition: background 1s var(--ease); pointer-events: none; }
        
        .pane { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 26px; padding: 40px; opacity: 0; transform: scale(.97) translateY(10px); transition: opacity .6s var(--ease), transform .6s var(--ease); pointer-events: none; }
        .pane.active { opacity: 1; transform: none; pointer-events: auto; }
        .pcap { font-family: 'Fraunces', serif; font-style: italic; color: var(--ink-soft); font-size: 1.02rem; text-align: center; }
        .pmock { width: min(430px, 100%); background: var(--paper); border: 1px solid var(--line); border-radius: 18px; padding: 26px 28px; box-shadow: 0 18px 44px rgba(22, 19, 15, .08); }
        .pdate { font-size: .68rem; letter-spacing: .12em; color: var(--ink-faint); font-weight: 600; margin-bottom: 8px; }
        .pmock h4 { font-size: 1.3rem; margin-bottom: 10px; }
        .ptype { font-family: 'Fraunces', serif; font-size: .98rem; color: var(--ink-soft); min-height: 76px; line-height: 1.7; }
        .ptype::after { content: ''; display: inline-block; width: 2px; height: 1em; background: var(--amber); margin-left: 2px; animation: caret 1s steps(1) infinite; }
        
        .sprout { width: 170px; margin-top: 6px; overflow: visible; }
        .spl { stroke: #e3dbcd; stroke-width: 2; stroke-dasharray: 140; stroke-dashoffset: 140; animation: mlDraw 5s var(--ease) infinite; }
        .spc { transform-origin: center; transform-box: fill-box; animation: dotBreathe 3s ease-in-out infinite; }
        .splbl { font: italic 11px Fraunces, serif; fill: #8a8174; }
        
        .bigwave { display: flex; align-items: flex-end; gap: 6px; height: 90px; }
        .bigwave b { width: 8px; border-radius: 6px; background: linear-gradient(180deg, var(--rose), var(--amber)); animation: wv 1.2s ease-in-out infinite; }
        .bigwave b:nth-child(odd) { animation-delay: .15s; } .bigwave b:nth-child(3n) { animation-delay: .3s; } .bigwave b:nth-child(4n) { animation-delay: .45s; }
        .wchips { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }
        .w-chip { padding: 9px 16px; border-radius: 999px; border: 1px solid var(--line); background: var(--paper); font-size: .82rem; color: var(--ink-soft); opacity: 0; animation: wchip 6s var(--ease) infinite; }
        .w-chip:nth-child(2) { animation-delay: 1s; } .w-chip:nth-child(3) { animation-delay: 2s; }
        @keyframes wchip { 0% { opacity: 0; transform: translateY(10px); } 12%, 70% { opacity: 1; transform: none; } 85%, 100% { opacity: 0; } }
        
        /* Interactive pad */
        .pad-wrap { position: relative; margin-top: 14px; border: 1.6px dashed var(--line); border-radius: 14px; background: var(--paper); overflow: hidden; }
        #pad { display: block; width: 100%; height: 120px; touch-action: none; cursor: crosshair; }
        .pad-hint { position: absolute; inset: 0; display: grid; place-items: center; font-family: 'Fraunces', serif; font-style: italic; color: var(--ink-faint); font-size: .95rem; pointer-events: none; transition: opacity .5s; }
        .pad-wrap.used .pad-hint { opacity: 0; }
        .pad-clear { position: absolute; right: 8px; bottom: 8px; font: 600 .68rem 'Inter', sans-serif; padding: 5px 12px; border-radius: 999px; border: 1px solid var(--line); background: var(--card); color: var(--ink-faint); transition: all .3s; z-index:10; }
        .pad-clear:active { color: var(--ink); transform: scale(0.95); }
        
        .fan { position: relative; width: 220px; height: 150px; }
        .fp { position: absolute; left: 50%; top: 20px; width: 110px; height: 84px; margin-left: -55px; border-radius: 10px; border: 4px solid #fff; box-shadow: 0 12px 30px rgba(22, 19, 15, .16); animation: fanmove 6s var(--ease) infinite; }
        .f1 { background: linear-gradient(135deg, #e5c39a, #d98a4b); }
        .f2 { background: linear-gradient(135deg, #cf7b6e, #b96a8c); animation-name: fanmove2; }
        .f3 { background: linear-gradient(135deg, #96a3bd, #6d7fa3); animation-name: fanmove3; }
        @keyframes fanmove { 0%, 15% { transform: rotate(0); } 35%, 75% { transform: rotate(-16deg) translateX(-54px); } 95%, 100% { transform: rotate(0); } }
        @keyframes fanmove2 { 0%, 15% { transform: none; } 35%, 75% { transform: translateY(-12px) scale(1.05); } 95%, 100% { transform: none; } }
        @keyframes fanmove3 { 0%, 15% { transform: rotate(0); } 35%, 75% { transform: rotate(16deg) translateX(54px); } 95%, 100% { transform: rotate(0); } }
        
        .autotasks { display: flex; flex-direction: column; gap: 14px; width: min(320px, 90%); }
        .atask { display: flex; align-items: center; gap: 12px; background: var(--paper); border: 1px solid var(--line); border-radius: 14px; padding: 14px 16px; font-size: .95rem; color: var(--ink-soft); }
        .atask i { width: 20px; height: 20px; border-radius: 6px; border: 1.8px solid var(--ink-faint); position: relative; flex-shrink: 0; animation: boxfill 8s var(--ease) infinite; }
        .atask i::after { content: '✓'; position: absolute; inset: 0; display: grid; place-items: center; color: #fff; font-size: .7rem; opacity: 0; animation: tickin 8s var(--ease) infinite; }
        .atask.t2 i, .atask.t2 i::after { animation-delay: 1.4s; }
        .atask.t3 i, .atask.t3 i::after { animation-delay: 2.8s; }
        @keyframes boxfill { 0%, 8% { background: transparent; border-color: var(--ink-faint); } 14%, 78% { background: var(--sage); border-color: var(--sage); } 90%, 100% { background: transparent; border-color: var(--ink-faint); } }
        @keyframes tickin { 0%, 8% { opacity: 0; transform: scale(.4); } 14%, 78% { opacity: 1; transform: scale(1); } 90%, 100% { opacity: 0; } }
        
        .refl { display: flex; align-items: center; gap: 38px; }
        .rring { position: relative; }
        .rring svg { transform: rotate(-90deg); }
        .rrf { stroke-dasharray: 277; stroke-dashoffset: 277; animation: ringLoop 6.5s var(--ease) infinite; }
        .rring > span { position: absolute; inset: 0; display: grid; place-items: center; font-size: 1.8rem; animation: letterPop 6.5s var(--ease) infinite; }
        .rband { display: flex; gap: 6px; align-items: flex-end; height: 76px; }
        .rband i { width: 14px; border-radius: 6px; transform-origin: bottom; animation: bandwv 3s ease-in-out infinite; }
        .rband i:nth-child(1) { background: #e5c39a; height: 38%; }
        .rband i:nth-child(2) { background: #d98a4b; height: 62%; animation-delay: .2s; }
        .rband i:nth-child(3) { background: #cf7b6e; height: 80%; animation-delay: .4s; }
        .rband i:nth-child(4) { background: #a3b39a; height: 55%; animation-delay: .6s; }
        .rband i:nth-child(5) { background: #7d9b76; height: 70%; animation-delay: .8s; }
        .rband i:nth-child(6) { background: #96a3bd; height: 46%; animation-delay: 1s; }
        .rband i:nth-child(7) { background: #6d7fa3; height: 64%; animation-delay: 1.2s; }
        @keyframes bandwv { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(1.3); } }
        
        .ghost { position: absolute; right: -8px; top: -16px; font-size: 7.5rem; line-height: 1; opacity: .07; pointer-events: none; animation: ghostFloat 9s ease-in-out infinite; }
        @keyframes ghostFloat { 0%, 100% { transform: rotate(-6deg) translateY(0); } 50% { transform: rotate(4deg) translateY(-14px); } }

        @media(max-width: 900px) {
          .showcase { grid-template-columns: 1fr; }
          .show-list { flex-direction: row; overflow-x: auto; padding-bottom: 6px; -ms-overflow-style: none; scrollbar-width: none; }
          .show-list::-webkit-scrollbar { display: none; }
          .show-tab { min-width: 200px; flex-shrink: 0; }
          .show-stage { min-height: 400px; }
        }
        @media(max-width: 600px) {
          .pmock { padding: 20px 16px; }
          .pcap { font-size: 0.95rem; }
          .pane { padding: 24px 16px; }
        }
      `}</style>

      <section className="block has-bg" id="features">
        <div className="dotgrid" aria-hidden="true" />
        <div className="blob b1" aria-hidden="true" />
        <div className="blob b2" aria-hidden="true" />

        <div className="wrap">
          <p className="kicker reveal">Everything, one quiet space</p>
          <h2 className="reveal">A journal that thinks the way you do — sideways.</h2>
          <p className="sub reveal d1">
            Life isn't linear, and neither is Soouls. Capture anything, in any form, and watch it
            find its place.
          </p>

          <div className="showcase reveal d2">
            <div className="show-list" role="tablist" aria-label="Feature showcase">
              {tabs.map((t, idx) => (
                <button
                  key={idx}
                  className={`show-tab ${idx === activeTab ? 'active' : ''}`}
                  type="button"
                  onClick={() => handleTabClick(idx)}
                >
                  <span className="tno">{t.no}</span>
                  <div>
                    <strong>{t.title}</strong>
                    <small>{t.desc}</small>
                  </div>
                  <i className="tbar" />
                </button>
              ))}
            </div>

            <div
              className="show-stage"
              style={{ '--stagec': tints[activeTab] } as React.CSSProperties}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {/* Tab 1: Write */}
              <div className={`pane ${activeTab === 0 ? 'active' : ''}`}>
                <span className="ghost">{tabs[0]?.icon}</span>
                <div className="pmock">
                  <p className="pdate">TUESDAY · 21:14</p>
                  <h4>The courage conversation</h4>
                  <p className="ptype">{typedText}</p>
                  <svg className="sprout" viewBox="0 0 170 60" fill="none" aria-hidden="true">
                    <path className="spl" d="M6 30 C 50 30, 80 12, 118 14" />
                    <circle className="spc" cx="132" cy="14" r="9" fill="#cf7b6e" />
                    <text x="132" y="44" textAnchor="middle" className="splbl">
                      studio dream
                    </text>
                  </svg>
                </div>
                <p className="pcap">
                  Every entry is a node. Watch it link itself.{' '}
                  <a
                    href="/home"
                    style={{ color: 'var(--amber)', fontWeight: 600, fontStyle: 'normal' }}
                  >
                    Try the writing room →
                  </a>
                </p>
              </div>

              {/* Tab 2: Speak */}
              <div className={`pane ${activeTab === 1 ? 'active' : ''}`}>
                <span className="ghost">{tabs[1]?.icon}</span>
                <div className="bigwave" aria-hidden="true">
                  {Array.from({ length: 18 }).map((_, i) => (
                    <b key={i} />
                  ))}
                </div>
                <div className="wchips" aria-hidden="true">
                  <span className="w-chip">“…found the courage”</span>
                  <span className="w-chip">mood: 🌤️ light</span>
                  <span className="w-chip">linked → people I love</span>
                </div>
                <p className="pcap">Speak. Soouls keeps the words and the feeling.</p>
              </div>

              {/* Tab 3: Doodle */}
              <div className={`pane ${activeTab === 2 ? 'active' : ''}`}>
                <span className="ghost">{tabs[2]?.icon}</span>
                <div className="pad-wrap" ref={wrapRef} style={{ width: 'min(430px, 100%)' }}>
                  <canvas ref={canvasRef} id="pad" style={{ height: '170px' }} />
                  <span className="pad-hint">this box is real ink — draw ✏️</span>
                  <button className="pad-clear" type="button" onClick={clearPad}>
                    clear
                  </button>
                </div>
                <p className="pcap">Sketch what words can't say. Ink lives beside your entries.</p>
              </div>

              {/* Tab 4: Collect */}
              <div className={`pane ${activeTab === 3 ? 'active' : ''}`}>
                <span className="ghost">{tabs[3]?.icon}</span>
                <div className="fan" aria-hidden="true">
                  <i className="fp f1" />
                  <i className="fp f2" />
                  <i className="fp f3" />
                </div>
                <p className="pcap">The visual scraps of a life, kept where they belong.</p>
              </div>

              {/* Tab 5: Intend */}
              <div className={`pane ${activeTab === 4 ? 'active' : ''}`}>
                <span className="ghost">{tabs[4]?.icon}</span>
                <div className="autotasks" aria-hidden="true">
                  <div className="atask t1">
                    <i />
                    <span>Call mum back</span>
                  </div>
                  <div className="atask t2">
                    <i />
                    <span>One phone-free walk</span>
                  </div>
                  <div className="atask t3">
                    <i />
                    <span>Finish chapter three</span>
                  </div>
                </div>
                <p className="pcap">
                  Intentions, not deadlines. They tick themselves off… eventually.
                </p>
              </div>

              {/* Tab 6: Reflect */}
              <div className={`pane ${activeTab === 5 ? 'active' : ''}`}>
                <span className="ghost">{tabs[5]?.icon}</span>
                <div className="refl" aria-hidden="true">
                  <div className="rring">
                    <svg width="110" height="110" viewBox="0 0 110 110">
                      <defs>
                        <linearGradient id="rg2" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0" stopColor="#d98a4b" />
                          <stop offset="1" stopColor="#cf7b6e" />
                        </linearGradient>
                      </defs>
                      <circle cx="55" cy="55" r="44" fill="none" stroke="#e3dbcd" strokeWidth="8" />
                      <circle
                        className="rrf"
                        cx="55"
                        cy="55"
                        r="44"
                        fill="none"
                        stroke="url(#rg2)"
                        strokeWidth="8"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span>💌</span>
                  </div>
                  <div className="rband">
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                  </div>
                </div>
                <p className="pcap">Every Sunday: a quiet letter written by your week.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
