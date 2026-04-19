'use client';

import { useEffect, useMemo, useState } from 'react';

type RoseLoaderProps = {
  className?: string;
  accentClassName?: string;
  label?: string;
};

function buildRosePath(detailScale: number, steps = 240) {
  return Array.from({ length: steps + 1 }, (_, index) => {
    const progress = index / steps;
    const t = progress * Math.PI * 2;
    const r = (9.2 + detailScale * 0.6) * (0.72 + detailScale * 0.28) * Math.cos(2 * t);
    const x = 50 + Math.cos(t) * r * 3.25;
    const y = 50 + Math.sin(t) * r * 3.25;
    return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
  }).join(' ');
}

export function RoseLoader({
  className,
  accentClassName,
  label = 'Loading',
}: RoseLoaderProps) {
  const [detailScale, setDetailScale] = useState(0.76);

  useEffect(() => {
    let frame = 0;
    let mounted = true;
    const startedAt = performance.now();

    const tick = (now: number) => {
      if (!mounted) {
        return;
      }

      const pulseProgress = ((now - startedAt) % 2000) / 2000;
      const pulse = 0.52 + ((Math.sin(pulseProgress * Math.PI * 2 + 0.55) + 1) / 2) * 0.48;
      setDetailScale(pulse);
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    return () => {
      mounted = false;
      cancelAnimationFrame(frame);
    };
  }, []);

  const path = useMemo(() => buildRosePath(detailScale), [detailScale]);

  return (
    <output
      className={['flex flex-col items-center gap-4 text-center', className]
        .filter(Boolean)
        .join(' ')}
      aria-live="polite"
      aria-label={label}
    >
      <div className="relative h-28 w-28">
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,var(--app-glow),transparent_68%)] opacity-75 blur-xl" />
        <svg viewBox="0 0 100 100" className="relative h-full w-full overflow-visible" aria-hidden="true">
          <path d={path} fill="none" stroke="currentColor" strokeWidth="1.15" className="text-white/10" />
          <path
            d={path}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={[
              'text-[var(--app-accent)] drop-shadow-[0_0_18px_var(--app-glow)]',
              accentClassName,
            ]
              .filter(Boolean)
              .join(' ')}
          />
        </svg>
      </div>
      <p className="text-xs uppercase tracking-[0.38em] text-[var(--app-text-muted)]">{label}</p>
    </output>
  );
}
