'use client';

import React from 'react';

export const LeafIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
  </svg>
);

export const DiamondIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polygon points="12 2 16 6 12 10 8 6 12 2" />
    <polygon points="12 14 16 18 12 22 8 18 12 14" />
    <polygon points="2 12 6 16 10 12 6 8 2 12" />
    <polygon points="14 12 18 16 22 12 18 8 14 12" />
  </svg>
);

export const CanvasLoopIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 12C9.5 8 5 8 5 12C5 16 9.5 16 12 12Z" />
    <path d="M12 12C14.5 8 19 8 19 12C19 16 14.5 16 12 12Z" />
    <path d="M12 12C8 9.5 8 5 12 5C16 5 16 9.5 12 12Z" />
    <path d="M12 12C8 14.5 8 19 12 19C16 19 16 14.5 12 12Z" />
  </svg>
);

export const CompassIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </svg>
);

export const NetworkIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="3" />
    <circle cx="18" cy="6" r="2" />
    <circle cx="6" cy="18" r="2" />
    <path d="M14.5 10.5l1.5-1.5" />
    <path d="M9.5 13.5l-1.5 1.5" />
  </svg>
);
