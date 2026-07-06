'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function FloatingOrbs() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const orbs = containerRef.current.querySelectorAll('.orb');
    
    // We use matchMedia or simple screen size to adjust number of orbs or spread
    const ctx = gsap.context(() => {
      orbs.forEach((orb) => {
        // Randomize initial position
        gsap.set(orb, {
          x: `random(0, ${typeof window !== 'undefined' ? window.innerWidth : 1000})`,
          y: `random(0, ${typeof window !== 'undefined' ? window.innerHeight : 1000})`,
          scale: 'random(0.5, 2.5)',
          opacity: 'random(0.5, 0.6)', // Less transparent (more opaque)
        });

        // Animate drifting
        gsap.to(orb, {
          x: '+=random(-800, 800)',
          y: '+=random(-800, 800)',
          rotation: 'random(-180, 180)',
          duration: 'random(30, 60)',
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      });
    }, containerRef);

    return () => ctx.revert(); // cleanup
  }, []);

  // Generate an array of orbs, reducing the number so it's not too cluttered
  const orbElements = Array.from({ length: 15 }).map((_, i) => {
    // Generate unique varying colors for each orb using green, purple, yellow, and orange hues
    const baseHues = [110, 260, 45, 25]; // green, purple, yellow, orange
    const hue = baseHues[i % baseHues.length] + (Math.random() * 20 - 10); // Slight random variance in color
    const color = `hsla(${hue}, 70%, 65%, 1)`; // Base color, transparency controlled by GSAP opacity
    
    return (
      <div
        key={i}
        className="orb absolute rounded-full"
        style={{
          width: '180px',
          height: '180px',
          background: `radial-gradient(circle, ${color} 0%, transparent 60%)`,
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />
    );
  });

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 0 }}
    >
      {orbElements}
    </div>
  );
}
