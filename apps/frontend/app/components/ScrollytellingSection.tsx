'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef } from 'react';

gsap.registerPlugin(ScrollTrigger);

export default function ScrollytellingSection() {
  const containerRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const capsRef = useRef<HTMLHeadingElement[]>([]);

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const cv = canvasRef.current;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0;
    let H = 0;

    const WORDS = [
      'deadline',
      'mum',
      'the garden',
      'novel draft',
      'rent',
      'old friend',
      'gym',
      'that email',
      'the trip',
      'apartment',
      'a promise',
      'therapy',
      'the studio',
      'sleep',
      'birthday',
      'the sea',
      'money',
      'courage',
      'monstera',
      'chapter 3',
      'the call',
      'sunday',
    ];
    const HUBS = [
      { x: 0.26, y: 0.36, c: '#d98a4b' },
      { x: 0.72, y: 0.3, c: '#cf7b6e' },
      { x: 0.36, y: 0.72, c: '#7d9b76' },
      { x: 0.74, y: 0.7, c: '#6d7fa3' },
    ];
    let pts: any[] = [];

    function rnd(seed: number) {
      const x = Math.sin(seed * 127.1) * 43758.5453;
      return x - Math.floor(x);
    }

    function rs() {
      W = cv.offsetWidth;
      H = cv.offsetHeight;
      cv.width = W * dpr;
      cv.height = H * dpr;
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
      pts = WORDS.map((w, i) => {
        const hub = HUBS[i % 4]!;
        const ang = rnd(i + 7) * 6.28;
        const dist = 54 + rnd(i + 3) * 70;
        return {
          w: w,
          c: hub.c,
          hub: i % 4,
          sx: rnd(i) * W * 0.9 + W * 0.05,
          sy: rnd(i + 40) * H * 0.8 + H * 0.1,
          tx: hub.x * W + Math.cos(ang) * dist,
          ty: hub.y * H + Math.sin(ang) * dist,
          r: 4 + rnd(i + 11) * 4,
          p: rnd(i + 23) * 6.28,
        };
      });
    }

    function ease(t: number) {
      return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
    }

    const progressRef = { current: 0 };
    const linkC = '76,69,59'; // default light theme connection color

    function draw(prog: number, t: number) {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);
      const m = ease(Math.min(1, Math.max(0, (prog - 0.15) / 0.6))); /* morph 15%..75% */
      const linkA = Math.min(1, Math.max(0, (prog - 0.62) / 0.25)); /* links fade in */

      /* hub glows */
      HUBS.forEach((h) => {
        const a = linkA * 0.9;
        if (a <= 0) return;
        const hx = h.x * W;
        const hy = h.y * H;
        const g = ctx.createRadialGradient(hx, hy, 0, hx, hy, 90);
        g.addColorStop(
          0,
          h.c +
            Math.round(a * 38)
              .toString(16)
              .padStart(2, '0'),
        );
        g.addColorStop(1, `${h.c}00`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(hx, hy, 90, 0, 6.28);
        ctx.fill();
      });

      /* links to hub */
      if (linkA > 0) {
        ctx.lineWidth = 1.2;
        pts.forEach((p) => {
          const hub = HUBS[p.hub]!;
          ctx.strokeStyle = `rgba(${linkC},${(linkA * 0.3).toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(hub.x * W, hub.y * H);
          ctx.stroke();
        });
      }

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      pts.forEach((p) => {
        const jx = reduced ? 0 : Math.sin(t / 1500 + p.p) * 5 * (1 - m * 0.4);
        const jy = reduced ? 0 : Math.cos(t / 1800 + p.p) * 5 * (1 - m * 0.4);
        p.x = p.sx + (p.tx - p.sx) * m + jx;
        p.y = p.sy + (p.ty - p.sy) * m + jy;
        ctx.fillStyle = p.c;
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 6.28);
        ctx.fill();
        ctx.globalAlpha = 1;

        ctx.fillStyle = `rgba(${linkC},${0.75 - m * 0.2})`;
        ctx.font = 'italic 13px Fraunces,serif';
        ctx.textAlign = 'center';
        ctx.fillText(p.w, p.x, p.y - p.r - 7);
      });

      /* captions */
      const ci = prog < 0.33 ? 0 : prog < 0.7 ? 1 : 2;
      capsRef.current.forEach((c, i) => {
        if (c) c.classList.toggle('on', i === ci);
      });
    }

    let animationFrameId: number;
    let isActive = true;

    function loop(t: number) {
      if (!isActive) return;
      draw(progressRef.current, t);
      animationFrameId = requestAnimationFrame(loop);
    }

    rs();
    window.addEventListener('resize', rs);

    // Use ScrollTrigger just to track progress cleanly
    const st = ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        progressRef.current = self.progress;
      },
    });

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      isActive = false;
      window.removeEventListener('resize', rs);
      cancelAnimationFrame(animationFrameId);
      st.kill();
    };
  }, []);

  return (
    <section ref={containerRef} className="story relative z-10 bg-transparent">
      <style>{`
        .story { height: 320vh; position: relative; }
        .story-stick {
          position: sticky; top: 0; height: 100svh; overflow: hidden;
          display: flex; align-items: center; justify-content: center;
        }
        #storyCanvas {
          position: absolute; inset: 0; width: 100%; height: 100%; z-index: 1; pointer-events: none;
        }
        .story-cap { 
          position: relative; z-index: 2; text-align: center; pointer-events: none; 
          width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; 
        }
        .story-cap h2 {
          position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);
          width: min(760px, 88vw); font-size: clamp(1.9rem, 4.6vw, 3.4rem);
          color: var(--ink, #16130f);
          opacity: 0;
          transition: opacity 0.6s ease, transform 0.8s cubic-bezier(.22,.8,.28,1);
        }
        .story-cap h2.on {
          opacity: 1;
        }
        .story-cap h2 em { font-style: italic; color: var(--amber, #d98a4b); font-weight: 380; font-family: 'Fraunces', Georgia, serif; }
      `}</style>

      <div className="story-stick">
        <canvas id="storyCanvas" ref={canvasRef} />

        <div className="story-cap">
          <h2
            ref={(el) => {
              if (el) capsRef.current[0] = el;
            }}
          >
            Life arrives <em>scattered.</em>
          </h2>
          <h2
            ref={(el) => {
              if (el) capsRef.current[1] = el;
            }}
          >
            Soouls listens for <em>the threads.</em>
          </h2>
          <h2
            ref={(el) => {
              if (el) capsRef.current[2] = el;
            }}
          >
            And your mind becomes <em>a map.</em>
          </h2>
        </div>
      </div>
    </section>
  );
}
