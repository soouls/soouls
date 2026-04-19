'use client';

import type { LucideIcon } from 'lucide-react';
import type { ButtonHTMLAttributes } from 'react';

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: LucideIcon;
  variant?: 'primary' | 'secondary';
}

export function ActionButton({
  children,
  icon: Icon,
  variant = 'primary',
  className = '',
  ...props
}: ActionButtonProps) {
  const baseStyles =
    'flex items-center justify-center gap-2 rounded-full px-6 py-3 font-clarity text-sm font-medium transition-all active:scale-95';
  const variants = {
    primary:
      'border border-[var(--app-border)] bg-[var(--app-surface-strong)] text-[var(--app-accent)] shadow-[0_12px_40px_-18px_var(--app-glow)] hover:bg-[color:var(--app-surface)] hover:border-[var(--app-accent-soft)]',
    secondary:
      'bg-white/5 text-[var(--app-text-muted)] hover:bg-white/10 hover:text-[var(--app-text)]',
  };

  return (
    <button type="button" className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </button>
  );
}
