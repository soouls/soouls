'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        aria-label="Toggle theme"
        className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--ink-soft)] hover:text-[#d98a4b] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
      >
        <span className="w-5 h-5" />
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle theme"
      className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--ink-soft)] hover:text-[#d98a4b] hover:bg-black/5 dark:hover:bg-white/5 transition-colors active:scale-95 duration-200"
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 animate-in fade-in zoom-in" />
      ) : (
        <Moon className="w-5 h-5 animate-in fade-in zoom-in" />
      )}
    </button>
  );
}
