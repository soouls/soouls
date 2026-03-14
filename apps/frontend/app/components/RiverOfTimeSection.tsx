'use client';

import { useEffect, useRef } from 'react';

interface JournalCard {
  id: string;
  date: string;
  text: string;
  highlighted?: boolean;
  style?: React.CSSProperties;
  size?: 'sm' | 'md' | 'lg';
}

const CARDS: JournalCard[] = [
  {
    id: 'c1',
    date: 'July 6',
    text: 'Getting it done today without any delay in results',
    style: {
      top: '25%',
      right: '12%',
      '--rotate': '-3deg',
    } as React.CSSProperties,
    size: 'md',
  },
  {
    id: 'c2',
    date: 'August 4',
    text: 'The scent of rain in the canyon was unlike anything ive felt.',
    style: {
      top: '15%',
      right: '35%',
      '--rotate': '2deg',
    } as React.CSSProperties,
    size: 'sm',
  },
  {
    id: 'c3',
    date: 'October 3',
    text: 'Finally, the clarity I was looking for.',
    style: {
      top: '35%',
      right: '5%',
      '--rotate': '-1deg',
    } as React.CSSProperties,
    size: 'lg',
  },
  {
    id: 'c4',
    date: 'July 6',
    text: 'Getting it done today without any delay in results',
    style: {
      top: '55%',
      right: '25%',
      '--rotate': '4deg',
    } as React.CSSProperties,
    size: 'lg',
  },
  {
    id: 'c5',
    date: 'August 4',
    text: 'The scent of rain in the canyon was unlike anything ive felt.',
    style: {
      top: '35%',
      right: '45%',
      '--rotate': '-2deg',
    } as React.CSSProperties,
    size: 'md',
  },
  {
    id: 'c6',
    date: 'Midnight Echoes',
    text: 'Why does the silence here feels so heavy yet so hollow?',
    highlighted: true,
    style: {
      top: '45%',
      right: '32%',
      '--rotate': '3deg',
    } as React.CSSProperties,
    size: 'lg',
  },
];

function FloatingCard({ card }: { card: JournalCard }) {
  const sizeMap = {
    // 133x69
    sm: {
      width: 133,
      fontSize: '9px',
      dateFontSize: '12.63px',
      padding: '10px 13px',
      gap: '9px',
      stroke: '0.45px',
      blur: '27px',
    },
    // 159x87
    md: {
      width: 159,
      fontSize: '10.78px',
      dateFontSize: '15px',
      padding: '17px 15px',
      gap: '11px',
      stroke: '0.54px',
      blur: '32.3px',
    },
    // 295x162
    lg: {
      width: 295,
      fontSize: '20px',
      dateFontSize: '28px',
      padding: '33px 29px',
      gap: '20px',
      stroke: '1px',
      blur: '60px',
    },
  };
  const s = sizeMap[card.size ?? 'md'];

  return (
    <div
      className="absolute rounded-[24px] cursor-pointer transition-all duration-500 hover:scale-105 hover:z-50 group hover:-translate-y-2"
      style={{
        ...card.style,
        width: s.width,
        padding: s.padding,
        background: card.highlighted ? 'rgba(224, 122, 95, 0.08)' : 'rgba(15, 15, 15, 0.5)',
        backdropFilter: `blur(${s.blur})`,
        WebkitBackdropFilter: `blur(${s.blur})`,
        animation: `card-float ${3 + Math.random() * 2}s ease-in-out infinite`,
        border: card.highlighted
          ? `${s.stroke} solid rgba(224,122,95,0.6)`
          : `${s.stroke} solid rgba(255,255,255,0.05)`,
        boxShadow: card.highlighted
          ? '0px 8px 32px 0px rgba(224, 122, 95, 0.15)'
          : '0 8px 32px rgba(0,0,0,0.3)',
      }}
    >
      <div className="absolute inset-0 rounded-[24px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none shadow-[0_0_30px_rgba(224,122,95,0.2)]" />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          justifyContent: 'center',
          gap: s.gap,
        }}
      >
        <span
          className="font-playfair"
          style={{
            fontSize: s.dateFontSize,
            color: '#EFEBDD',
            lineHeight: '1em',
            letterSpacing: '-0.035em',
            textAlign: 'right',
          }}
        >
          {card.date}
        </span>
        <p
          className="font-urbanist"
          style={{
            fontSize: s.fontSize,
            color: '#A8A8A8',
            lineHeight: '1em',
            letterSpacing: '-0.035em',
            textAlign: 'right',
          }}
        >
          {card.text}
        </p>
      </div>
    </div>
  );
}

export default function RiverOfTimeSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  // Scroll-triggered reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.reveal').forEach((el, i) => {
              setTimeout(() => el.classList.add('in-view'), i * 120);
            });
          }
        });
      },
      { threshold: 0.15 },
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Parallax on cards
  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current || !cardsRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const progress = -rect.top / (rect.height + window.innerHeight);
      cardsRef.current.style.transform = `translateY(${progress * -80}px)`;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section
      ref={sectionRef}
      id="product"
      className="relative overflow-hidden flex items-center w-full px-6 py-24 lg:p-[60px]"
      style={{
        backgroundColor: '#222222',
        minHeight: '100svh',
      }}
    >
      {/* Left Column — Text */}
      <div
        ref={leftRef}
        className="relative z-10 flex flex-col justify-start w-full lg:max-w-[650px] mx-auto lg:ml-[80px] lg:mr-auto text-center lg:text-left"
      >
        <div className="reveal" style={{ marginBottom: '22px' }}>
          <h2
            className="font-playfair"
            style={{
              fontSize: 'clamp(48px, 10vw, 80px)',
              lineHeight: '1em',
              letterSpacing: '-0.035em',
              color: '#D6C2A3',
            }}
          >
            The River of Time
          </h2>
        </div>

        <div className="reveal" style={{ marginBottom: '60px' }}>
          <p
            className="font-urbanist mx-auto lg:ml-0"
            style={{
              fontSize: 'clamp(18px, 4vw, 24px)',
              lineHeight: '1.4em',
              letterSpacing: '-0.035em',
              color: '#EFEBDD',
              opacity: 0.85,
              maxWidth: '600px',
            }}
          >
            A seamless, non-linear architecture that lets your life flow naturally. Forget
            chronological constraints — connect moments by their emotional resonance
          </p>
        </div>

        {/* Feature tag */}
        <div className="reveal group cursor-pointer inline-flex flex-col items-center lg:items-start lg:mt-4">
          <div className="flex items-center justify-center lg:justify-start gap-[10px] mb-[6px]">
            <div className="relative flex items-center justify-center w-[30px] h-[30px]">
              {/* Dynamic Glow Background */}
              <div className="absolute inset-0 bg-[#E07A5F] rounded-full blur-[15px] opacity-30 group-hover:opacity-60 group-hover:blur-[22px] transition-all duration-500" />

              {/* Magic Star with Upward Arrow SVG */}
              <svg
                width="34"
                height="34"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="relative z-10 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(224,122,95,0.9)] transition-all duration-500"
                style={{ marginLeft: '-4px' }}
              >
                {/* Custom Organic Star & Arrow Path */}
                <path
                  d="M12 2.5C12 2.5 10.8 6.5 10.5 7.5C10.2 8.5 6.5 9 5.5 9.5C4.5 10 5.5 11 6.5 12C7.5 13 8 16 9 17C10 18 11 15 12 14.5C13 14 16 17 17 16C18 15 15.5 13 16.5 12C17.5 11 20.5 10 19.5 9.5C18.5 9 14.5 9 14 8C13.5 7 12 2.5 12 2.5Z"
                  stroke="#E07A5F"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Inner Arrow upward swoop */}
                <path
                  d="M9.5 6C10.5 5 12 2.5 12 2.5C12 2.5 13.5 5 14.5 6M12 2.5V8"
                  stroke="#E07A5F"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Organic floating particle dots to the right */}
                <path
                  d="M20 12C20.5 12 21 12 21.5 12.5C21 13 20 13 20 12.5V12Z"
                  fill="#E07A5F"
                  stroke="#E07A5F"
                  strokeWidth="1"
                />
                <path
                  d="M18.5 15C19 15 19.5 15.5 19.5 16C19 16.5 18 16 18.5 15Z"
                  fill="#E07A5F"
                  stroke="#E07A5F"
                  strokeWidth="0.8"
                />
                <path
                  d="M21 17C21.5 17 22 17.5 22 18C21.5 18.5 20.5 18 21 17Z"
                  fill="#E07A5F"
                  stroke="#E07A5F"
                  strokeWidth="0.8"
                />
              </svg>
            </div>

            <span
              className="font-playfair italic font-medium transition-all duration-500 group-hover:text-[#F39982] group-hover:translate-x-1"
              style={{
                fontSize: 'clamp(28px, 6vw, 42px)',
                lineHeight: '1em',
                color: '#E07A5F',
                letterSpacing: '-0.01em',
                textShadow: '0px 0px 15px rgba(224, 122, 95, 0.5)',
              }}
            >
              Dynamic Synthesis
            </span>
          </div>
          <p
            className="font-urbanist transition-all duration-300 group-hover:text-[#e07a5f] group-hover:drop-shadow-[0_0_8px_rgba(224,122,95,0.5)] group-hover:translate-x-1"
            style={{
              fontSize: '18px',
              lineHeight: '1.4em',
              letterSpacing: '-0.01em',
              color: '#EFEBDD',
              opacity: 0.85,
              maxWidth: '480px',
              marginTop: '4px',
            }}
          >
            Our engine suggests connections based on semantic meaning and mood, not just dates.
          </p>
        </div>
      </div>

      {/* Right: Floating journal cards (Hidden on small screens) */}
      <div
        ref={cardsRef}
        className="hidden md:block absolute right-0 top-0 h-[100svh] parallax-layer overflow-hidden pointer-events-none"
        style={{ width: '55%' }}
      >
        {CARDS.map((card) => (
          <FloatingCard key={card.id} card={card} />
        ))}
      </div>
    </section>
  );
}
