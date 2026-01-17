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
    },
  },
  plugins: [],
};

export default config;
