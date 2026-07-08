'use client';

export default function SecondaryMarquee() {
  return (
    <div className="marquee-band" aria-hidden="true">
      <style>{`
        .marquee-band {
          border-top: 1px solid var(--soouls-border);
          border-bottom: 1px solid var(--soouls-border);
          padding: 24px 0;
          overflow: hidden;
          background: var(--soouls-bg-elevated);
          position: relative;
          z-index: 10;
        }
        .marquee-track {
          display: flex;
          width: max-content;
          animation: marqueeScroll 30s linear infinite;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
        .marquee-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 30px;
          white-space: nowrap;
          font-family: 'Fraunces', serif;
          font-style: italic;
          font-size: 20px;
          color: var(--soouls-text-muted);
        }
        .marquee-item .mdot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #a390e4; /* violet */
        }
        .marquee-item:nth-child(even) .mdot {
          background: #d98a4b; /* ember/accent */
        }
        @keyframes marqueeScroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
      <div className="marquee-track">
        <div className="marquee-item"><span className="mdot"></span>Overthinkers</div>
        <div className="marquee-item"><span className="mdot"></span>Late-night writers</div>
        <div className="marquee-item"><span className="mdot"></span>People in therapy</div>
        <div className="marquee-item"><span className="mdot"></span>Founders & builders</div>
        <div className="marquee-item"><span className="mdot"></span>Students under pressure</div>
        <div className="marquee-item"><span className="mdot"></span>Quiet processors</div>
        {/* Duplicated for infinite scroll */}
        <div className="marquee-item"><span className="mdot"></span>Overthinkers</div>
        <div className="marquee-item"><span className="mdot"></span>Late-night writers</div>
        <div className="marquee-item"><span className="mdot"></span>People in therapy</div>
        <div className="marquee-item"><span className="mdot"></span>Founders & builders</div>
        <div className="marquee-item"><span className="mdot"></span>Students under pressure</div>
        <div className="marquee-item"><span className="mdot"></span>Quiet processors</div>
      </div>
    </div>
  );
}
