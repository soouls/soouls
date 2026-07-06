'use client';

import { useEffect, useRef } from 'react';

export default function MindMapCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0;
    let H = 0;
    let nodes: any[] = [];
    let pulses: any[] = [];
    let mouse = { x: -9999, y: -9999 };
    
    const P = ['#d98a4b', '#cf7b6e', '#7d9b76', '#6d7fa3', '#b7a98f'];
    const LD = 150;
    const LINKC = '227,219,205'; // rgba for --soouls-border roughly

    const rs = () => {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      
      const count = Math.max(26, Math.min(64, Math.floor((W * H) / 26000)));
      nodes = [];
      for (let i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.28,
          vy: (Math.random() - 0.5) * 0.28,
          r: 2 + Math.random() * 4.5,
          c: P[i % 5],
          p: Math.random() * 6.28
        });
      }
    };

    const spawnPulse = () => {
      for (let tries = 0; tries < 20; tries++) {
        const a = nodes[Math.floor(Math.random() * nodes.length)];
        const b = nodes[Math.floor(Math.random() * nodes.length)];
        if (a !== b && Math.hypot(a.x - b.x, a.y - b.y) < LD) {
          pulses.push({ a, b, t: 0 });
          return;
        }
      }
    };

    let animationFrameId: number;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const tick = (t: number) => {
      ctx.clearRect(0, 0, W, H);
      
      // Draw lines between nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LD) {
            ctx.strokeStyle = `rgba(${LINKC},${((1 - d / LD) * 0.35).toFixed(3)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Update and draw nodes
      nodes.forEach((n) => {
        if (!reduced) {
          n.x += n.vx;
          n.y += n.vy;
          const mdx = mouse.x - n.x;
          const mdy = mouse.y - n.y;
          const md = Math.hypot(mdx, mdy);
          if (md < 180 && md > 0.001) {
            n.x += (mdx / md) * 0.22;
            n.y += (mdy / md) * 0.22;
          }
          if (n.x < -20) n.x = W + 20;
          if (n.x > W + 20) n.x = -20;
          if (n.y < -20) n.y = H + 20;
          if (n.y > H + 20) n.y = -20;
        }
        
        const br = 1 + Math.sin(t / 1400 + n.p) * 0.22;
        ctx.globalAlpha = 0.85;
        ctx.fillStyle = n.c;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * br, 0, 6.28);
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // Traveling thought pulses
      if (!reduced && Math.random() < 0.02 && pulses.length < 5) spawnPulse();
      
      pulses = pulses.filter((pl) => {
        pl.t += 0.016;
        const x = pl.a.x + (pl.b.x - pl.a.x) * pl.t;
        const y = pl.a.y + (pl.b.y - pl.a.y) * pl.t;
        const g = ctx.createRadialGradient(x, y, 0, x, y, 9);
        g.addColorStop(0, 'rgba(217,138,75,.9)');
        g.addColorStop(1, 'rgba(217,138,75,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, 9, 0, 6.28);
        ctx.fill();
        return pl.t < 1;
      });

      if (!reduced) animationFrameId = requestAnimationFrame(tick);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };

    window.addEventListener('resize', rs);
    window.addEventListener('pointermove', handleMouseMove);
    
    rs();
    
    if (reduced) {
      tick(0);
    } else {
      animationFrameId = requestAnimationFrame(tick);
    }

    return () => {
      window.removeEventListener('resize', rs);
      window.removeEventListener('pointermove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      id="mindmap"
      ref={canvasRef}
      className="absolute inset-0 w-full h-full z-0 pointer-events-auto"
      style={{ opacity: 0.8 }}
      aria-hidden="true"
    />
  );
}
