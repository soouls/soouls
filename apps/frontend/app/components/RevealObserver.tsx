'use client';

import { useEffect } from 'react';

export default function RevealObserver() {
  useEffect(() => {
    // We use a robust intersection observer that runs globally.
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            e.target.classList.add('in-view');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1 },
    );

    const observeAll = () => {
      document.querySelectorAll('.reveal:not(.in):not(.in-view)').forEach((el) => {
        io.observe(el);
      });
    };

    // Initial check
    observeAll();

    // Catch elements that might render asynchronously or after hydration
    const mutationObserver = new MutationObserver(() => {
      observeAll();
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return null;
}
