'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';

export default function SundayReviewSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const constraintsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.reveal').forEach((el, i) => {
              setTimeout(() => el.classList.add('in-view'), i * 150);
            });
          }
        });
      },
      { threshold: 0.1 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="sunday-review"
      className="relative flex items-center overflow-hidden px-6 py-24 md:px-[60px] md:py-[120px]"
      style={{
        backgroundColor: '#1D1E1E', // Solid dark slate base
        minHeight: '100svh',
      }}
    >
      {/* Massive intense golden glow spanning entire bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{
          height: '80vh',
          background:
            'linear-gradient(to top, rgba(200, 155, 100, 0.45) 0%, rgba(200, 155, 100, 0.15) 40%, rgba(29, 30, 30, 0) 100%)',
          mixBlendMode: 'screen',
          opacity: 0.9,
        }}
      />
      {/* Intense localized glow behind right text */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: '1200px',
          height: '1200px',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(210, 170, 110, 0.3) 0%, rgba(210, 170, 110, 0.05) 50%, rgba(0, 0, 0, 0) 70%)',
          bottom: '-400px',
          right: '-200px',
          mixBlendMode: 'screen',
        }}
      />
      {/* Softer glow behind left card */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: '1000px',
          height: '1000px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(190, 150, 90, 0.2) 0%, rgba(0, 0, 0, 0) 60%)',
          bottom: '-300px',
          left: '-100px',
        }}
      />

      <div
        ref={constraintsRef}
        className="max-w-[1400px] mx-auto w-full relative z-10 flex flex-col-reverse lg:flex-row gap-16 lg:gap-[120px] items-center justify-between"
      >
        {/* Left (Bottom on mobile): Sunday Review App Canvas Card */}
        <div className="reveal flex justify-center w-full lg:w-5/12 mx-auto lg:ml-0 lg:mr-auto lg:pl-[10%]">
          {/* Card Container */}
          <motion.div
            drag
            dragConstraints={constraintsRef}
            whileHover={{ scale: 1.02 }}
            whileDrag={{ scale: 1.05, cursor: 'grabbing', zIndex: 50 }}
            className="relative font-urbanist w-full max-w-[420px] cursor-grab lg:flex-shrink-0"
            style={{
              background: 'linear-gradient(145deg, #1A1A1A 0%, #121212 100%)', // Pure dark slate matching image
              borderRadius: '28px',
              padding: 'clamp(24px, 6vw, 40px)',
              boxShadow: '0 40px 80px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.03)',
            }}
          >
            {/* Header: SUNDAY REVIEW | NOV. 02, 2023 */}
            <div className="flex justify-between items-center mb-10">
              <span
                style={{
                  fontSize: '12px',
                  letterSpacing: '0.08em',
                  color: '#A8A8A8',
                  fontWeight: 400,
                }}
              >
                SUNDAY REVIEW
              </span>
              <span
                className="font-playfair"
                style={{
                  fontSize: '12px',
                  letterSpacing: '0.05em',
                  color: '#8E8E8E',
                  fontWeight: 400,
                }}
              >
                NOV. 02, 2023
              </span>
            </div>

            {/* Title */}
            <h3
              className="font-playfair font-normal mb-5"
              style={{
                fontSize: '36px',
                lineHeight: '1em',
                letterSpacing: '-0.01em',
                color: '#E5D4B3',
              }}
            >
              Steady & <span className="italic">Resilient</span>
            </h3>

            {/* Paragraph */}
            <p
              style={{
                fontSize: '15px',
                lineHeight: '1.4em',
                color: '#A0A09B',
                letterSpacing: '-0.01em',
                fontWeight: 300,
              }}
            >
              This week, your entries gravitated toward themes of endurance. The silence of the
              desert reflected in your Tuesday voice notes, revealing a growing peace with the
              unknown..
            </p>

            {/* Divider lines */}
            <div className="flex gap-4 mt-8 mb-6 opacity-40">
              <div style={{ height: '1px', background: '#E5D4B3', flex: 1.5 }} />
              <div style={{ height: '1px', background: '#E5D4B3', flex: 1 }} />
            </div>

            {/* Graph Card Component */}
            <div
              className="mt-6 rounded-2xl relative"
              style={{
                background: '#161513',
                padding: '24px 24px',
                border: '1px solid rgba(255,255,255,0.02)',
                boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.2)',
              }}
            >
              <h4
                style={{
                  fontSize: '9px',
                  letterSpacing: '0.15em',
                  color: '#6A6559',
                  marginBottom: '32px',
                  fontWeight: 600,
                }}
              >
                WEEKLY EMOTIONAL TRAJECTORY
              </h4>

              {/* Advanced SVG Line Chart based on screenshot */}
              <div className="relative w-full h-[60px] mb-8">
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 300 60"
                  preserveAspectRatio="none"
                  style={{ overflow: 'visible' }}
                >
                  {/* The connected golden path */}
                  <path
                    d="M 5 35 L 50 48 L 100 30 L 140 42 L 190 25 L 240 20 L 295 28"
                    fill="none"
                    stroke="#D8C8A3"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Data Point Dots */}
                  <circle cx="5" cy="35" r="2.5" fill="#161513" stroke="#D8C8A3" strokeWidth="1" />
                  <circle cx="50" cy="48" r="2.5" fill="#161513" stroke="#D8C8A3" strokeWidth="1" />
                  <circle
                    cx="100"
                    cy="30"
                    r="2.5"
                    fill="#161513"
                    stroke="#D8C8A3"
                    strokeWidth="1"
                  />
                  <circle
                    cx="140"
                    cy="42"
                    r="2.5"
                    fill="#161513"
                    stroke="#D8C8A3"
                    strokeWidth="1"
                  />
                  <circle
                    cx="190"
                    cy="25"
                    r="2.5"
                    fill="#161513"
                    stroke="#D8C8A3"
                    strokeWidth="1"
                  />
                  <circle
                    cx="240"
                    cy="20"
                    r="2.5"
                    fill="#161513"
                    stroke="#D8C8A3"
                    strokeWidth="1"
                  />
                  <circle
                    cx="295"
                    cy="28"
                    r="2.5"
                    fill="#161513"
                    stroke="#D8C8A3"
                    strokeWidth="1"
                  />
                </svg>
              </div>

              {/* Data Labels Grid */}
              <div
                className="flex flex-col gap-3"
                style={{
                  fontSize: '8.5px',
                  letterSpacing: '0.05em',
                  color: '#666',
                }}
              >
                <div className="flex flex-row gap-6">
                  <span>
                    MON <span style={{ color: '#333' }}>—</span> REFLECTIVE
                  </span>
                  <span>
                    TUE <span style={{ color: '#333' }}>—</span> OVERWHELMED
                  </span>
                </div>
                <div className="flex flex-row gap-6">
                  <span>
                    WED <span style={{ color: '#333' }}>—</span> GROUNDED
                  </span>
                  <span>
                    THU <span style={{ color: '#333' }}>—</span> RESTLESS
                  </span>
                  <span>
                    FRI <span style={{ color: '#333' }}>—</span> FOCUSED
                  </span>
                </div>
                <div className="flex flex-row gap-6">
                  <span>
                    SAT <span style={{ color: '#333' }}>—</span> CALM
                  </span>
                  <span>
                    SUN <span style={{ color: '#333' }}>—</span> CENTERED
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right: Typography Match */}
        <div className="reveal flex-1 flex flex-col items-center lg:items-center text-center max-w-[700px] mr-auto">
          <h2
            className="font-playfair font-normal"
            style={{
              fontSize: 'clamp(60px, 8vw, 110px)', // Massive like image
              lineHeight: '0.9em',
              letterSpacing: '-0.04em',
              color: '#E5D4B3',
              marginBottom: '30px',
              textShadow: '0 10px 40px rgba(229, 212, 179, 0.15)',
            }}
          >
            The Sunday Review
          </h2>
          <p
            className="font-urbanist"
            style={{
              fontSize: 'clamp(20px, 2.2vw, 26px)',
              lineHeight: '1.25em',
              letterSpacing: '-0.03em',
              color: '#FEFEFE',
              opacity: 0.9,
              maxWidth: '600px',
              fontWeight: 400,
            }}
          >
            A beautifully typeset, single-screen summary of your week. <br /> Synthesized by intent
            delivered with care
          </p>
        </div>
      </div>
    </section>
  );
}
