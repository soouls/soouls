import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui-kit/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Aura System
        'aura-joy': '#FDE68A',
        'aura-melancholy': '#94A3B8',
        'aura-focus': '#99F6E4',
        'aura-anxiety': '#FDA4AF',
        // Base Palette
        'base-cream': '#FAF9F6',
        'base-charcoal': '#1E1E1E',
        // Legacy colors (keeping for compatibility during transition)
        happy: '#ffd700',
        sad: '#4a90e2',
        anxious: '#ff6b6b',
        calm: '#51cf66',
        angry: '#ff4757',
        primary: '#6366f1',
        secondary: '#8b5cf6',
        background: '#0a0a0a',
        surface: '#1a1a1a',
        text: '#ffffff',
        'text-muted': '#a0a0a0',
      },
      fontFamily: {
        editorial: ['var(--font-playfair)', 'serif'],
        clarity: ['var(--font-geist-sans)', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        float: 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
