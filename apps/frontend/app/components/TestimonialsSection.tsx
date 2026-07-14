'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef } from 'react';

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
  {
    quote:
      'I stopped trying to journal in order. Now I just empty my head and let Soouls find the shape of it later.',
    author: 'Priya, illustrator',
    bg: '#fdf6db',
    rot: '-2deg',
  },
  {
    quote:
      "The weekly reflection is the only productivity feature that's ever made me tear up a little, unexpectedly, on a Sunday.",
    author: 'Tomás, product designer',
    bg: '#e6f0de',
    rot: '1deg',
  },
  {
    quote:
      'First app that made my 2am spirals feel like data I could look at, instead of doom I had to sit inside.',
    author: 'Aiko, therapist',
    bg: '#ede3f8',
    rot: '-1.5deg',
  },
  {
    quote:
      "Six months of clusters later, I can actually see the shape of my grief getting smaller. I didn't expect that from an app.",
    author: 'Marcus, writer',
    bg: '#f6f4df',
    rot: '2deg',
  },
];

export default function TestimonialsSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.sticky-note', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
        },
        y: 50,
        opacity: 0,
        rotation: 5,
        duration: 0.8,
        stagger: 0.15,
        ease: 'back.out(1.5)',
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="testimonials"
      ref={sectionRef}
      className="py-20 md:py-32 px-6 max-w-[90rem] mx-auto relative z-10 overflow-hidden"
    >
      <div className="flex items-center gap-3 mb-4 lg:ml-12">
        <span className="w-2 h-2 rounded-full bg-[#a390e4] animate-pulse" />
        <span className="text-[#a390e4] text-xs font-playfair italic">from people mid-thought</span>
      </div>
      <h2 className="text-3xl md:text-5xl font-playfair font-medium text-[var(--soouls-text-strong)] mb-16 text-left lg:ml-12 max-w-xl">
        Notes people left themselves, and us.
      </h2>

      <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-8 flex-wrap lg:flex-nowrap">
        {testimonials.map((t, idx) => (
          <div
            key={idx}
            className="sticky-note p-8 rounded shadow-[0_15px_35px_rgba(0,0,0,0.05)] w-full sm:max-w-[280px] h-[320px] flex flex-col justify-between transition-transform duration-300 hover:scale-[1.03] hover:z-10 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]"
            style={{ backgroundColor: t.bg, transform: `rotate(${t.rot})` }}
          >
            <p className="font-playfair text-lg text-[#16130f] leading-snug italic">"{t.quote}"</p>
            <p className="font-mono text-[10px] text-[#4a4237] mt-8 uppercase tracking-widest">
              — {t.author}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
