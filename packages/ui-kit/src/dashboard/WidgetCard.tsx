'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';

interface WidgetCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  actionText?: string;
  onAction?: () => void;
  className?: string;
  delay?: number;
}

export function WidgetCard({
  title,
  subtitle,
  children,
  actionText,
  onAction,
  className = '',
  delay = 0,
}: WidgetCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`group relative overflow-hidden rounded-[2rem] border border-white/7 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.02))] p-6 shadow-[0_24px_80px_-52px_rgba(0,0,0,0.65)] transition-colors hover:bg-[color:var(--app-surface-strong)] ${className}`}
    >
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h3 className="font-urbanist text-xl font-medium text-[var(--app-text)]">{title}</h3>
          {subtitle && (
            <p className="mt-1 font-clarity text-sm text-[var(--app-text-muted)]">{subtitle}</p>
          )}
        </div>
        {actionText && (
          <button
            type="button"
            onClick={onAction}
            className="group/btn flex items-center gap-2 rounded-full px-3 py-1 font-clarity text-xs font-medium text-[var(--app-text-muted)] transition-colors hover:bg-white/5 hover:text-[var(--app-text)]"
          >
            {actionText}
            <ArrowRight className="h-3 w-3 transition-transform group-hover/btn:translate-x-0.5" />
          </button>
        )}
      </div>

      <div className="relative z-10">{children}</div>

      {/* Subtle gradient glow effect */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div className="absolute inset-0 bg-[radial-gradient(circle,var(--app-glow)_0%,transparent_62%)] blur-3xl" />
      </div>
    </motion.div>
  );
}
