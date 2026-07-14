import gsap from 'gsap';
import type React from 'react';
import { useEffect, useRef } from 'react';

type Node = {
  label: string;
  r: number; // distance from center in px
  theta: number; // angle in degrees
};

type NodeClusterProps = {
  color: string;
  style?: React.CSSProperties;
  nodes: Node[];
};

export default function NodeCluster({ color, style, nodes }: NodeClusterProps) {
  const clusterRef = useRef<HTMLDivElement>(null);

  const calculatedNodes = nodes.map((n) => ({
    ...n,
    x: n.r * Math.cos((n.theta * Math.PI) / 180),
    y: n.r * Math.sin((n.theta * Math.PI) / 180),
  }));

  useEffect(() => {
    if (!clusterRef.current) return;
    const ctx = gsap.context(() => {
      // Drift animation
      gsap.to(clusterRef.current, {
        x: '+=random(-30, 30)',
        y: '+=random(-30, 30)',
        rotation: 'random(-5, 5)',
        duration: 'random(10, 20)',
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      // Form in animation (scale and fade)
      gsap.from(clusterRef.current, {
        scale: 0.5,
        opacity: 0,
        duration: 2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: clusterRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      });
    }, clusterRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={clusterRef} className="absolute pointer-events-none z-0" style={style}>
      {/* Background Soft Glow */}
      <div
        className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[80px] opacity-30"
        style={{ backgroundColor: color, width: '250px', height: '250px' }}
      />

      {/* Connection Lines */}
      <svg className="absolute top-0 left-0 overflow-visible">
        {calculatedNodes.map((n, i) => (
          <line
            key={`line-${i}`}
            x1="0"
            y1="0"
            x2={n.x}
            y2={n.y}
            stroke="var(--soouls-border)"
            strokeWidth="1.5"
            opacity="0.6"
          />
        ))}
      </svg>

      {/* Node Dots and Labels */}
      {calculatedNodes.map((n, i) => (
        <div
          key={`node-${i}`}
          className="absolute"
          style={{ transform: `translate(${n.x}px, ${n.y}px)` }}
        >
          <div
            className="w-2.5 h-2.5 rounded-full absolute -top-[5px] -left-[5px]"
            style={{ backgroundColor: color }}
          />
          <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[0.7rem] italic text-[var(--soouls-text-faint)] font-playfair whitespace-nowrap">
            {n.label}
          </span>
        </div>
      ))}

      {/* Center Dot (optional, subtle) */}
      <div className="absolute top-0 left-0 -translate-x-[3px] -translate-y-[3px] w-1.5 h-1.5 rounded-full bg-[var(--soouls-border)] opacity-50" />
    </div>
  );
}
