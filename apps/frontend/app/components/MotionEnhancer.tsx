'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function MotionEnhancer() {
  useEffect(() => {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReduced) return;

    // ── 1. Smooth staggered reveals for ALL section headers ──
    gsap.utils.toArray('.kicker').forEach((el) => {
      const kicker = el as HTMLElement;
      kicker.classList.add('in-view');
    });

    // ── 2. Parallax depth for floating chips ──
    gsap.utils.toArray('.chip-f').forEach((el) => {
      const chip = el as HTMLElement;
      gsap.to(chip, {
        y: -60,
        ease: 'none',
        scrollTrigger: {
          trigger: chip,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5,
        },
      });
    });

    // ── 3. Section-level parallax for visual depth ──
    gsap.utils.toArray('.hw-card').forEach((el, i) => {
      const card = el as HTMLElement;
      gsap.fromTo(card, 
        { y: 30 + (i * 10) },
        {
          y: -10,
          ease: 'none',
          scrollTrigger: {
            trigger: card,
            start: 'top 90%',
            end: 'bottom 10%',
            scrub: 2,
          },
        }
      );
    });

    // ── 4. Magnetic button effect ──
    const buttons = document.querySelectorAll('button, a.px-8');
    buttons.forEach((btn) => {
      const el = btn as HTMLElement;
      const handleMouseMove = (e: MouseEvent) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(el, {
          x: x * 0.15,
          y: y * 0.15,
          duration: 0.4,
          ease: 'power2.out',
        });
      };
      const handleMouseLeave = () => {
        gsap.to(el, {
          x: 0,
          y: 0,
          duration: 0.6,
          ease: 'elastic.out(1.2, 0.5)',
        });
      };
      el.addEventListener('mousemove', handleMouseMove);
      el.addEventListener('mouseleave', handleMouseLeave);
    });

    // ── 5. Tilt effect on privacy list items and stat boxes ──
    const tiltCards = document.querySelectorAll('.priv-list li, .stat-box, .sticky-note, .vault-card');
    tiltCards.forEach((card) => {
      const el = card as HTMLElement;
      const handleMouseMove = (e: MouseEvent) => {
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        gsap.to(el, {
          rotateY: x * 8,
          rotateX: -y * 8,
          duration: 0.4,
          ease: 'power2.out',
          transformPerspective: 800,
        });
      };
      const handleMouseLeave = () => {
        gsap.to(el, {
          rotateY: 0,
          rotateX: 0,
          duration: 0.8,
          ease: 'elastic.out(1, 0.4)',
        });
      };
      el.addEventListener('mousemove', handleMouseMove);
      el.addEventListener('mouseleave', handleMouseLeave);
    });

    // ── 6. Footer giant wordmark parallax ──
    const wordmark = document.querySelector('.font-playfair.italic.font-medium');
    if (wordmark) {
      gsap.to(wordmark, {
        y: -40,
        scale: 1.05,
        ease: 'none',
        scrollTrigger: {
          trigger: wordmark,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 2,
        },
      });
    }

    // ── 7. Social icons bounce on scroll ──
    const socialIcons = document.querySelectorAll('[aria-label]');
    socialIcons.forEach((icon, i) => {
      gsap.fromTo(icon,
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          delay: i * 0.1,
          ease: 'back.out(2)',
          scrollTrigger: {
            trigger: icon,
            start: 'top 95%',
          },
        }
      );
    });

    // ── 8. Counter animation for stat numbers ──
    const statNums = document.querySelectorAll('.stat-box .num');
    statNums.forEach((num) => {
      const el = num as HTMLElement;
      const finalText = el.textContent || '';
      
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          if (finalText === '100%') {
            const obj = { val: 0 };
            gsap.to(obj, {
              val: 100,
              duration: 2,
              ease: 'power2.out',
              onUpdate: () => {
                el.textContent = Math.round(obj.val) + '%';
              },
            });
          }
        },
      });
    });

    // ── 9. CTA section entrance ──
    const ctaSection = document.querySelector('.bg-\\[\\#e6e2f8\\]');
    if (ctaSection) {
      gsap.fromTo(ctaSection,
        { scale: 0.92, opacity: 0.5, borderRadius: '60px' },
        {
          scale: 1,
          opacity: 1,
          borderRadius: '48px',
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: ctaSection,
            start: 'top 80%',
          },
        }
      );
    }

    // ── 10. Scroll progress indicator ──
    const progressBar = document.createElement('div');
    progressBar.id = 'scroll-progress';
    progressBar.style.cssText = `
      position: fixed; top: 0; left: 0; height: 3px; z-index: 9999;
      background: linear-gradient(90deg, #d98a4b, #cf7b6e, #7d9b76);
      transform-origin: left; transform: scaleX(0);
      transition: none; pointer-events: none;
    `;
    document.body.appendChild(progressBar);

    gsap.to(progressBar, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.3,
      },
    });

    // ── 11. Staggered feature tab entrance ──
    gsap.utils.toArray('.show-tab').forEach((el, i) => {
      gsap.fromTo(el as HTMLElement,
        { x: -30, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.7,
          delay: i * 0.08,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el as HTMLElement,
            start: 'top 90%',
          },
        }
      );
    });

    // ── 12. Hover glow effect on CTA buttons ──  
    const ctaButtons = document.querySelectorAll('.bg-\\[\\#16130f\\]');
    ctaButtons.forEach((btn) => {
      const el = btn as HTMLElement;
      el.addEventListener('mouseenter', () => {
        gsap.to(el, {
          boxShadow: '0 0 40px rgba(217, 138, 75, 0.3), 0 20px 60px rgba(22, 19, 15, 0.3)',
          duration: 0.4,
        });
      });
      el.addEventListener('mouseleave', () => {
        gsap.to(el, {
          boxShadow: '0 0 0px rgba(217, 138, 75, 0), 0 10px 30px rgba(22, 19, 15, 0.15)',
          duration: 0.6,
        });
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
      const bar = document.getElementById('scroll-progress');
      if (bar) bar.remove();
    };
  }, []);

  return null;
}
