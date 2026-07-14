'use client';

export default function MarqueeSection() {
  return (
    <div className="marquee" aria-hidden="true">
      <style>{`
        .marquee {
          border-top: 1px solid var(--soouls-border);
          border-bottom: 1px solid var(--soouls-border);
          padding: 24px 0;
          overflow: hidden;
          background: var(--soouls-bg-elevated);
          white-space: nowrap;
          position: relative;
          z-index: 10;
        }
        .marquee-track {
          display: inline-flex;
          gap: 56px;
          animation: marquee 34s linear infinite;
          will-change: transform;
        }
        .marquee span {
          font-family: 'Playfair Display', serif;
          font-size: 1.2rem;
          font-style: italic;
          color: var(--soouls-text-faint);
          display: inline-flex;
          align-items: center;
          gap: 56px;
        }
        .marquee i {
          font-style: normal;
          color: #d98a4b;
        }
        @keyframes marquee { to { transform: translateX(-50%); } }
      `}</style>

      <div className="marquee-track">
        <span>
          write it <i>✦</i> speak it <i>✦</i> doodle it <i>✦</i> map it <i>✦</i> feel it <i>✦</i>{' '}
          reflect on it <i>✦</i>
        </span>
        <span>
          write it <i>✦</i> speak it <i>✦</i> doodle it <i>✦</i> map it <i>✦</i> feel it <i>✦</i>{' '}
          reflect on it <i>✦</i>
        </span>
        <span>
          write it <i>✦</i> speak it <i>✦</i> doodle it <i>✦</i> map it <i>✦</i> feel it <i>✦</i>{' '}
          reflect on it <i>✦</i>
        </span>
        <span>
          write it <i>✦</i> speak it <i>✦</i> doodle it <i>✦</i> map it <i>✦</i> feel it <i>✦</i>{' '}
          reflect on it <i>✦</i>
        </span>
      </div>
    </div>
  );
}
