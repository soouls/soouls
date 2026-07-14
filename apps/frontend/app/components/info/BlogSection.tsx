'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, BookOpen, Check, Clock } from 'lucide-react';
import { useRef } from 'react';

gsap.registerPlugin(ScrollTrigger);

export default function BlogSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const featuredImgRef = useRef<HTMLImageElement>(null);

  useGSAP(
    () => {
      // Parallax for featured image
      if (featuredImgRef.current) {
        gsap.to(featuredImgRef.current, {
          y: '20%',
          ease: 'none',
          scrollTrigger: {
            trigger: '.featured-post-container',
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      }

      // Reveal post cards
      gsap.fromTo(
        '.blog-card',
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.blog-grid',
            start: 'top 85%',
          },
        },
      );

      // Newsletter floating animation
      gsap.fromTo(
        '.newsletter-glow',
        { scale: 0.8, opacity: 0.3 },
        { scale: 1.2, opacity: 0.6, duration: 3, yoyo: true, repeat: -1, ease: 'sine.inOut' },
      );
    },
    { scope: containerRef },
  );

  const posts = [
    {
      title: 'The Eternal Solitude',
      category: 'PHILOSOPHY',
      image:
        'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1000&auto=format&fit=crop',
      date: 'MARCH 12, 2026',
      readTime: '6 min read',
    },
    {
      title: 'Fluid Dynamics of Thought',
      category: 'SCIENCE',
      image:
        'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000&auto=format&fit=crop',
      date: 'MARCH 08, 2026',
      readTime: '4 min read',
    },
    {
      title: 'Blindness of the North',
      category: 'CULTURE',
      image:
        'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?q=80&w=1000&auto=format&fit=crop',
      date: 'FEB 28, 2026',
      readTime: '8 min read',
    },
    {
      title: 'Earth Metamorphosis',
      category: 'NATURE',
      image:
        'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1000&auto=format&fit=crop',
      date: 'FEB 20, 2026',
      readTime: '5 min read',
    },
    {
      title: 'Cosmic Humidity',
      category: 'SPACE',
      image:
        'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=1000&auto=format&fit=crop',
      date: 'FEB 14, 2026',
      readTime: '7 min read',
    },
  ];

  return (
    <section
      id="blog"
      className="relative w-full py-10 bg-transparent overflow-hidden"
      ref={containerRef}
    >
      <style>{`
        .animated-underline {
          position: relative;
          display: inline-block;
        }
        .animated-underline::after {
          content: '';
          position: absolute;
          width: 100%;
          transform: scaleX(0);
          height: 2px;
          bottom: 0;
          left: 0;
          background-color: var(--soouls-accent);
          transform-origin: bottom right;
          transition: transform 0.4s cubic-bezier(0.86, 0, 0.07, 1);
        }
        .group:hover .animated-underline::after {
          transform: scaleX(1);
          transform-origin: bottom left;
        }
        
        .editorial-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 2.5rem;
        }
        
        .post-span-8 { grid-column: span 12; }
        .post-span-4 { grid-column: span 12; }
        
        @media (min-width: 1024px) {
          .post-span-8 { grid-column: span 8; }
          .post-span-4 { grid-column: span 4; }
        }
      `}</style>

      <div className="relative z-10 max-w-[1240px] mx-auto px-6">
        {/* Header */}
        <div className="mb-16 md:mb-24 flex flex-col md:flex-row justify-between items-start md:items-end gap-8 reveal">
          <div className="max-w-2xl text-left">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#E07A5F]/10 mb-6 transition-transform duration-300 active:scale-95 hover:rotate-12">
              <BookOpen className="w-6 h-6 text-[#E07A5F]" />
            </div>
            <p className="font-urbanist text-[11px] font-bold text-[#E07A5F] font-semibold tracking-tight mb-6 block">
              The Soouls Journal
            </p>
            <h1 className="font-playfair text-4xl sm:text-5xl md:text-7xl font-bold text-[var(--ink)] leading-[1.1] mb-6">
              Thoughts on <br className="hidden sm:block" />{' '}
              <em className="italic text-[#E07A5F]">thinking</em>
            </h1>
          </div>
          <button
            type="button"
            className="group px-8 py-4 rounded-full border border-[#e3dbcd] bg-[#fdfaf6]/80 backdrop-blur-sm text-[var(--ink)] font-urbanist font-bold text-sm font-semibold tracking-tight hover:bg-[var(--ink)] hover:border-[var(--ink)] hover:text-white transition-colors transition-transform transition-shadow duration-300 shadow-sm flex items-center gap-2"
          >
            View All Articles
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Featured Post */}
        <div className="featured-post-container group relative w-full h-[400px] md:h-[600px] mb-16 rounded-3xl md:rounded-[3rem] overflow-hidden cursor-pointer reveal border border-[#e3dbcd]/20 shadow-xl">
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors transition-transform transition-shadow duration-300 z-10 pointer-events-none" />

          <div className="absolute inset-0 -top-[20%] h-[140%] w-full">
            <img
              ref={featuredImgRef}
              src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=2000&auto=format&fit=crop"
              alt="Featured Post"
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-[1.5s] ease-out"
            />
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10 pointer-events-none" />

          <div className="absolute bottom-0 left-0 p-8 sm:p-12 md:p-20 z-20 max-w-3xl transform group-hover:-translate-y-2 transition-transform duration-300">
            <div className="flex items-center gap-4 mb-6">
              <span className="font-urbanist text-xs font-bold text-[#E07A5F] font-semibold tracking-tight">
                Featured Thinking
              </span>
              <span className="flex items-center gap-1.5 font-urbanist text-[10px] text-white/60 font-bold font-semibold tracking-tight bg-white/10 px-3 py-1 rounded-full backdrop-blur-md">
                <Clock className="w-3 h-3" /> 10 min read
              </span>
            </div>

            <h3 className="font-playfair text-3xl sm:text-4xl md:text-6xl font-bold text-white mb-6 group-hover:text-[#fdfaf6] transition-colors leading-tight animated-underline pb-2">
              The Art of Slow Living in a Fast World
            </h3>
            <p className="font-urbanist text-white/80 text-xl mb-10 line-clamp-2 max-w-2xl leading-relaxed">
              How to reclaim your attention and find stillness in a culture that rewards constant
              motion, infinite scrolling, and perpetual availability.
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop"
                  alt="Author"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-urbanist text-white text-sm font-bold font-semibold tracking-tight">
                  By Elena Rossi
                </span>
                <span className="font-urbanist text-white/60 text-xs font-semibold tracking-tight">
                  April 02, 2026
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Editorial Post Grid */}
        <div className="blog-grid editorial-grid mb-20 md:mb-32">
          {posts.map((post, idx) => (
            <div
              key={post.title}
              className={`blog-card group cursor-pointer ${idx === 0 ? 'post-span-8' : 'post-span-4'}`}
            >
              <div
                className={`relative ${idx === 0 ? 'h-[400px] md:h-[480px]' : 'h-[280px] md:h-[320px]'} rounded-3xl md:rounded-[2.5rem] overflow-hidden mb-6 border border-[#e3dbcd]/50 shadow-sm group-hover:shadow-[0_20px_40px_rgba(224,122,95,0.15)] transition-colors transition-transform transition-shadow duration-300`}
              >
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300 z-10 pointer-events-none" />
                <img
                  src={post.image}
                  alt={post.title}
                  className="absolute inset-0 w-full h-full object-cover group-active:scale-95 transition-transform duration-500 ease-out"
                />
              </div>

              <div className="px-2">
                <div className="flex justify-between items-center mb-4">
                  <span className="inline-block px-3 py-1 bg-[#E07A5F]/10 rounded-full font-urbanist text-[10px] font-bold text-[#E07A5F] font-semibold tracking-tight transform group-hover:-translate-y-1 transition-transform duration-300">
                    {post.category}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="font-urbanist text-[10px] text-[var(--ink-soft)] font-bold font-semibold tracking-tight">
                      {post.date}
                    </span>
                    <span className="flex items-center gap-1 font-urbanist text-[10px] text-[var(--ink-faint)] font-bold font-semibold tracking-tight">
                      <Clock className="w-3 h-3" /> {post.readTime}
                    </span>
                  </div>
                </div>
                <h4
                  className={`font-playfair font-bold text-[var(--ink)] leading-tight animated-underline pb-1 ${idx === 0 ? 'text-4xl' : 'text-2xl'}`}
                >
                  {post.title}
                </h4>
              </div>
            </div>
          ))}
        </div>

        {/* Newsletter: The Weekly Whisper */}
        <div className="max-w-[1000px] mx-auto reveal" style={{ transitionDelay: '200ms' }}>
          <div className="relative p-8 sm:p-12 md:p-24 rounded-[2rem] md:rounded-[4rem] bg-gradient-to-br from-[#fdfaf6]/80 to-white/60 backdrop-blur-3xl border border-[#e3dbcd]/60 overflow-hidden flex flex-col items-center text-center shadow-[0_8px_32px_rgba(224,122,95,0.06)] group">
            <div className="newsletter-glow absolute top-0 right-0 w-[400px] h-[400px] bg-[#E07A5F]/10 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none transition-opacity duration-500" />
            <div
              className="newsletter-glow absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#6450d6]/10 blur-[80px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none transition-opacity duration-500"
              style={{ animationDelay: '1.5s' }}
            />

            <div className="relative z-10 w-full flex flex-col items-center">
              <h3 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--ink)] mb-6">
                The Weekly <em className="italic text-[#E07A5F]">Whisper</em>
              </h3>
              <p className="font-urbanist text-[var(--ink-soft)] text-lg mb-12 max-w-lg leading-relaxed">
                A curated collection of insights, art, and philosophy delivered to your inbox every
                Sunday. Quiet, ad-free, and always meaningful.
              </p>

              <form
                className="w-full max-w-lg flex flex-col sm:flex-row gap-4 relative z-10"
                onSubmit={(e) => {
                  e.preventDefault();
                  const target = e.currentTarget;
                  target.classList.add('animate-pulse');
                  setTimeout(() => target.classList.remove('animate-pulse'), 500);
                }}
              >
                <div className="relative flex-1">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    className="w-full bg-white border border-[#e3dbcd] rounded-full px-8 py-5 text-[var(--ink)] font-urbanist focus:outline-none focus:border-[#E07A5F] focus:ring-4 focus:ring-[#E07A5F]/10 transition-colors transition-transform transition-shadow shadow-sm peer"
                    required
                  />
                  <div className="absolute inset-0 rounded-full border-2 border-transparent peer-focus:border-[#E07A5F]/30 pointer-events-none transition-colors" />
                </div>
                <button
                  type="submit"
                  className="px-10 py-5 bg-[var(--ink)] text-[#f7f3ec] font-urbanist font-bold text-sm font-semibold tracking-tight rounded-full hover:bg-black hover:scale-105 active:scale-[0.97] transition-colors transition-transform transition-shadow duration-300 shadow-[0_10px_20px_rgba(22,19,15,0.15)] whitespace-nowrap overflow-hidden relative group/submit"
                >
                  <span className="relative z-10 group-active/submit:text-transparent transition-colors">
                    Subscribe
                  </span>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-active/submit:opacity-100 transition-opacity">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
