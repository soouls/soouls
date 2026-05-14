'use client';

import { motion } from 'framer-motion';

export function RoseLoader({
  className = '',
  color = 'currentColor',
}: {
  className?: string;
  color?: string;
}) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <motion.svg
        viewBox="0 0 100 100"
        className="w-full h-full overflow-visible"
        animate={{ rotate: 360 }}
        transition={{ duration: 16, ease: 'linear', repeat: Number.POSITIVE_INFINITY }}
      >
        {/* Core petals */}
        {[0, 1, 2, 3].map((i) => (
          <motion.path
            key={i}
            d="M50 50 C 50 5, 95 5, 50 50"
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            initial={{ rotate: i * 90 }}
            animate={{
              rotate: i * 90 + 360,
              scale: [0.85, 1.15, 0.85],
              opacity: [0.3, 0.9, 0.3],
            }}
            transition={{
              rotate: { duration: 12, ease: 'linear', repeat: Number.POSITIVE_INFINITY },
              scale: {
                duration: 4,
                ease: 'easeInOut',
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.5,
              },
              opacity: {
                duration: 4,
                ease: 'easeInOut',
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.5,
              },
            }}
            style={{ transformOrigin: '50px 50px' }}
          />
        ))}
        {/* Outer petals */}
        {[0, 1, 2, 3].map((i) => (
          <motion.path
            key={`outer-${i}`}
            d="M50 50 C 10 50, 10 90, 50 50"
            fill="none"
            stroke={color}
            strokeWidth="1"
            strokeLinecap="round"
            initial={{ rotate: i * 90 + 45 }}
            animate={{
              rotate: i * 90 + 45 - 360,
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              rotate: { duration: 16, ease: 'linear', repeat: Number.POSITIVE_INFINITY },
              scale: {
                duration: 5,
                ease: 'easeInOut',
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.6,
              },
              opacity: {
                duration: 5,
                ease: 'easeInOut',
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.6,
              },
            }}
            style={{ transformOrigin: '50px 50px' }}
          />
        ))}
        {/* Center glowing orb */}
        <motion.circle
          cx="50"
          cy="50"
          r="4"
          fill={color}
          initial={{ opacity: 0.4 }}
          animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.3, 0.8] }}
          transition={{ duration: 2.5, ease: 'easeInOut', repeat: Number.POSITIVE_INFINITY }}
          style={{ filter: 'blur(1px)' }}
        />
        <motion.circle
          cx="50"
          cy="50"
          r="1.5"
          fill="#fff"
          initial={{ opacity: 0.5 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, ease: 'easeInOut', repeat: Number.POSITIVE_INFINITY }}
        />
      </motion.svg>
    </div>
  );
}
