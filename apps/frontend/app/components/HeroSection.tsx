'use client';

import { useEffect, useRef } from 'react';

export default function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current || !contentRef.current) return;
      const scrollY = window.scrollY;
      const sectionTop = sectionRef.current.offsetTop;
      const relativeScroll = scrollY - sectionTop;

      // Parallax effect for the text content
      contentRef.current.style.transform = `translateY(${relativeScroll * 0.15}px)`;
      contentRef.current.style.opacity = `${Math.max(0, 1 - relativeScroll / 500)}`;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Video auto-play from 3 seconds
    const videoElement = document.getElementById('hero-video') as HTMLVideoElement;
    let timeUpdateHandler: (() => void) | null = null;
    let loadedMetadataHandler: (() => void) | null = null;

    if (videoElement) {
      loadedMetadataHandler = () => {
        // Fast forward 3 seconds initially
        if (videoElement.currentTime < 3) {
          videoElement.currentTime = 3;
        }
        videoElement.play().catch((e) => console.log('Video play failed:', e));
      };

      if (videoElement.readyState >= 1) {
        loadedMetadataHandler();
      } else {
        videoElement.addEventListener('loadedmetadata', loadedMetadataHandler);
      }

      timeUpdateHandler = () => {
        // If native loop resets it, or we are within the first 3 seconds, jump to 3s
        if (videoElement.currentTime < 3) {
          videoElement.currentTime = 3;
          videoElement.play().catch(() => {});
        }
      };
      videoElement.addEventListener('timeupdate', timeUpdateHandler);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (videoElement) {
        if (timeUpdateHandler) videoElement.removeEventListener('timeupdate', timeUpdateHandler);
        if (loadedMetadataHandler)
          videoElement.removeEventListener('loadedmetadata', loadedMetadataHandler);
      }
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative w-full overflow-hidden bg-[#222222]"
      style={{
        height: '100svh',
        minHeight: '700px',
      }}
    >
      {/* Hero Background Video */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0 w-full h-full"
          dangerouslySetInnerHTML={{
            __html: `
              <video
                id="hero-video"
                autoplay
                loop
                muted
                playsinline
                poster="/hero-bg-figma.png"
                class="w-full h-full object-cover"
                style="width: 100%; height: 100%; object-fit: cover;"
              >
                <source src="/images/red_sun_remix.mp4" type="video/mp4" />
              </video>
            `,
          }}
        />
        {/* Dark overlay to make the white text readable */}
        <div className="absolute inset-0 bg-black/30 z-[1]" />
      </div>

      {/* Content */}
      <div
        ref={contentRef}
        className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4"
      >
        <div className="flex flex-col items-center">
          <span
            className="font-urbanist font-bold text-white tracking-tight"
            style={{ fontSize: 'clamp(40px, 8vw, 80px)', lineHeight: '1em' }}
          >
            Welcome to a
          </span>

          <div className="flex flex-wrap justify-center items-center gap-4 mt-3 mb-8">
            <span
              className="font-playfair font-bold italic text-[#E07A5F]"
              style={{
                fontSize: 'clamp(46px, 9vw, 92px)',
                lineHeight: '1em',
                textShadow: '0px 7px 16px rgba(224, 124, 96, 0.4)',
              }}
            >
              quieter
            </span>
            <span
              className="font-urbanist font-bold text-white tracking-tight"
              style={{ fontSize: 'clamp(40px, 8vw, 80px)', lineHeight: '1em' }}
            >
              way to think.
            </span>
          </div>
        </div>

        <p
          className="font-urbanist font-normal mb-8 text-[#EFEBDD] opacity-90 max-w-[760px] md:mb-11"
          style={{ fontSize: 'clamp(16px, 4vw, 20px)', lineHeight: '1.5em' }}
        >
          Non-linear journaling designed for depth. Capture your thoughts as they happen, not just
          when they fit a timeline. Build a map of your mind.
        </p>

        <a
          href="/sign-up"
          className="font-urbanist font-semibold px-8 h-16 rounded-[14px] flex items-center transition-all duration-300 hover:-translate-y-1 active:scale-95 group"
          style={{
            fontSize: '20px',
            backgroundColor: '#D17B5B',
            color: '#222222',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = '#262626';
            (e.currentTarget as HTMLElement).style.color = '#D17B5B';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = '#D17B5B';
            (e.currentTarget as HTMLElement).style.color = '#222222';
          }}
        >
          Start Writing
        </a>

        {/* Scroll Indicator Group */}
        <div className="absolute bottom-8 flex flex-col items-center gap-3 w-full md:bottom-12 md:gap-5 px-4 text-center">
          <p
            className="font-playfair italic text-[#D9D9D9] opacity-90 tracking-wide"
            style={{ fontSize: 'clamp(18px, 4vw, 26px)' }}
          >
            No cards, No noise, Just your story
          </p>

          <div className="animate-bounce">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 11L12 19L20 11"
                stroke="#D3A771"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M4 4L12 12L20 4"
                stroke="#D3A771"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
