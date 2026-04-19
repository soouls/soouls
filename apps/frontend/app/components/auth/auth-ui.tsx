'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import type { HTMLInputTypeAttribute, ReactNode } from 'react';
import { CurveLoader } from '../CurveLoader';

type AuthScaffoldProps = {
  eyebrow: string;
  title: ReactNode;
  description: string;
  footer?: ReactNode;
  sideNote?: ReactNode;
  children: ReactNode;
};

const stars = Array.from({ length: 26 }, (_, index) => ({
  id: index,
  size: index % 5 === 0 ? 3 : 2,
  top: `${(index * 17) % 100}%`,
  left: `${(index * 37) % 100}%`,
  delay: `${(index % 7) * 0.8}s`,
}));

export function AuthScaffold({
  eyebrow,
  title,
  description,
  footer,
  sideNote,
  children,
}: AuthScaffoldProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--app-bg)] text-[var(--app-text)]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,var(--app-glow),transparent_42%)] opacity-50" />
        <div className="absolute left-[-10%] top-[12%] h-[42rem] w-[42rem] rounded-full border border-[var(--app-border)] opacity-30 blur-[1px]" />
        <div className="absolute right-[-12%] top-[18%] h-[34rem] w-[34rem] rounded-full border border-white/5 opacity-25" />
        {stars.map((star) => (
          <span
            key={star.id}
            className="absolute rounded-full bg-white/70 opacity-70 animate-pulse"
            style={{
              top: star.top,
              left: star.left,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: star.delay,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex min-h-screen flex-col justify-between px-6 py-8 sm:px-10">
        <div className="flex items-center justify-between text-sm text-[var(--app-text-muted)]">
          <Link href="/" className="font-editorial text-4xl text-[var(--app-accent-strong)]">
            SoulCanvas
          </Link>
          {sideNote}
        </div>

        <div className="mx-auto grid w-full max-w-6xl gap-10 py-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="hidden lg:block">
            <div className="max-w-2xl space-y-8">
              <div className="inline-flex rounded-full border border-[var(--app-border)] bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.35em] text-[var(--app-accent)]">
                {eyebrow}
              </div>
              <div className="space-y-5">
                <h1 className="max-w-xl font-editorial text-6xl leading-[0.94]">{title}</h1>
                <p className="max-w-xl text-lg leading-8 text-[var(--app-text-muted)]">
                  {description}
                </p>
              </div>
              <div className="rounded-[2rem] border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-[0_24px_80px_-40px_var(--app-glow)]">
                <CurveLoader />
                <p className="mt-4 max-w-lg text-sm leading-7 text-[var(--app-text-muted)]">
                  A calm entry flow on the outside. Secure Clerk auth underneath. No prebuilt
                  widgets, no generic account chrome.
                </p>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="mx-auto w-full max-w-xl rounded-[2.4rem] border border-[var(--app-border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-3 shadow-[0_40px_120px_-50px_var(--app-glow)]"
          >
            <div className="rounded-[2rem] border border-white/5 bg-[var(--app-surface)] p-6 sm:p-8">
              {children}
            </div>
          </motion.div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 text-xs uppercase tracking-[0.3em] text-[var(--app-text-muted)]">
          <div className="flex items-center gap-5">
            <Link href="/" className="transition hover:text-[var(--app-text)]">
              Privacy
            </Link>
            <Link href="/" className="transition hover:text-[var(--app-text)]">
              Terms
            </Link>
            <Link href="/" className="transition hover:text-[var(--app-text)]">
              Contact
            </Link>
          </div>
          <div>{footer}</div>
        </div>
      </div>
    </div>
  );
}

type AuthInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: HTMLInputTypeAttribute;
  autoComplete?: string;
  hint?: string;
};

export function AuthInput({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  autoComplete,
  hint,
}: AuthInputProps) {
  return (
    <label className="block space-y-3">
      <div className="text-xs uppercase tracking-[0.32em] text-[var(--app-text-muted)]">
        {label}
      </div>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        autoComplete={autoComplete}
        className="w-full rounded-[1.6rem] border border-[var(--app-border)] bg-black/20 px-5 py-4 text-base text-[var(--app-text)] placeholder:text-white/25 focus:border-[var(--app-accent)] focus:bg-black/30"
      />
      {hint ? <p className="text-sm text-[var(--app-text-muted)]">{hint}</p> : null}
    </label>
  );
}

type AuthButtonProps = {
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary';
};

export function AuthButton({
  children,
  disabled,
  onClick,
  type = 'button',
  variant = 'primary',
}: AuthButtonProps) {
  const shared =
    'inline-flex w-full items-center justify-center rounded-full px-5 py-4 text-base font-semibold transition disabled:cursor-not-allowed disabled:opacity-50';

  const styles =
    variant === 'primary'
      ? 'bg-[var(--app-accent)] text-[#120d0a] shadow-[0_18px_60px_-26px_var(--app-glow)] hover:brightness-105'
      : 'border border-[var(--app-border)] bg-white/5 text-[var(--app-text)] hover:bg-white/10';

  return (
    <button type={type} disabled={disabled} onClick={onClick} className={`${shared} ${styles}`}>
      {children}
    </button>
  );
}
