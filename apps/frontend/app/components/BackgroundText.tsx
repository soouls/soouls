'use client';

export function BackgroundText() {
  return (
    <div className="absolute left-0 right-0 z-0 flex justify-center overflow-hidden pointer-events-none select-none whitespace-nowrap top-[calc(120px-9vw)] md:top-[calc(192px-9vw)] lg:top-[3vw]">
      <div
        className="text-transparent"
        style={{
          fontFamily: "'ABC Whyte Inktrap', var(--font-urbanist), sans-serif",
          WebkitTextStroke: '1px rgba(255, 255, 255, 0.65)',
          fontSize: '18vw',
          fontWeight: 400,
          lineHeight: 1,
          letterSpacing: '-0.03em',
        }}
      >
        Soouls in
      </div>
    </div>
  );
}
