'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';

export function Dialog({
  children,
  open,
  onOpenChange,
}: {
  children: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </DialogPrimitive.Root>
  );
}

export function DialogTrigger({ children, asChild }: { children: ReactNode; asChild?: boolean }) {
  return <DialogPrimitive.Trigger asChild={asChild}>{children}</DialogPrimitive.Trigger>;
}

export function DialogContent({ children, title }: { children: ReactNode; title: string }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-slate-950/68 backdrop-blur-sm animate-in fade-in duration-200" />
      <DialogPrimitive.Content className="admin-glass fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 space-y-4 rounded-[1.35rem] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between">
          <DialogPrimitive.Title className="font-display text-xl text-white">
            {title}
          </DialogPrimitive.Title>
          <DialogPrimitive.Close
            aria-label="Close dialog"
            className="rounded-lg p-1.5 text-slate-400 transition-colors duration-200 hover:bg-white/5 hover:text-white"
          >
            <X className="h-5 w-5" />
          </DialogPrimitive.Close>
        </div>
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function StatCard({
  icon,
  value,
  label,
  trend,
}: {
  icon: ReactNode;
  value: number | string;
  label: string;
  trend?: string;
}) {
  return (
    <div className="admin-glass group relative overflow-hidden rounded-[1.35rem] p-5 transition-[border-color,background-color,transform] duration-300 hover:-translate-y-0.5 hover:border-amber-300/18">
      <div className="absolute -right-5 -top-5 h-28 w-28 rounded-full bg-amber-300/[0.045] blur-2xl transition-colors duration-300 group-hover:bg-amber-300/[0.075]" />
      <div className="relative">
        <div className="text-amber-200/80">{icon}</div>
        <div className="mt-3 font-mono text-3xl font-semibold tracking-tight text-white">
          {value}
        </div>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</span>
          {trend && (
            <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
              {trend}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="admin-glass rounded-[1.35rem] p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg text-pretty text-white">{title}</h2>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
    revoked: 'bg-rose-400/10 text-rose-400 border-rose-400/20',
    pending: 'bg-amber-400/10 text-amber-300 border-amber-400/20',
    invited: 'bg-blue-400/10 text-blue-300 border-blue-400/20',
    locked: 'bg-orange-400/10 text-orange-300 border-orange-400/20',
    suspended: 'bg-rose-400/10 text-rose-400 border-rose-400/20',
    beta: 'bg-violet-400/10 text-violet-300 border-violet-400/20',
    free: 'bg-slate-400/10 text-slate-300 border-slate-400/20',
    premium: 'bg-amber-400/10 text-amber-300 border-amber-400/20',
    enterprise: 'bg-violet-400/10 text-violet-300 border-violet-400/20',
    accepted: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
    expired: 'bg-slate-400/10 text-slate-500 border-slate-400/20',
    delivered: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
    queued: 'bg-blue-400/10 text-blue-300 border-blue-400/20',
    failed: 'bg-rose-400/10 text-rose-400 border-rose-400/20',
    draft: 'bg-slate-400/10 text-slate-400 border-slate-400/20',
    sent: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
  };

  const colorClass =
    colors[status.toLowerCase()] ?? 'bg-slate-400/10 text-slate-400 border-slate-400/20';

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-wider ${colorClass}`}
    >
      {status}
    </span>
  );
}

export function ToggleSwitch({
  enabled,
  onToggle,
  disabled,
}: {
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
        enabled ? 'bg-emerald-500/60' : 'bg-slate-600/60'
      } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white shadow-md transition-transform duration-300 ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

export function EmptyState({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[1.35rem] border border-dashed border-white/[0.09] bg-white/[0.015] py-12 text-center">
      <div className="text-slate-600">{icon}</div>
      <div className="mt-3 text-sm font-medium text-slate-400">{title}</div>
      <div className="mt-1 text-xs text-slate-600">{description}</div>
    </div>
  );
}

export function ActionButton({
  children,
  onClick,
  variant = 'default',
  disabled,
}: {
  children: ReactNode;
  onClick: () => void;
  variant?: 'default' | 'primary' | 'danger';
  disabled?: boolean;
}) {
  const colors = {
    default: 'border-white/10 text-white hover:border-white/20 hover:bg-white/[0.06]',
    primary:
      'border-transparent bg-[#d5a147] text-slate-950 font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_16px_40px_-22px_rgba(213,161,71,0.85)] hover:bg-[#e0b25d]',
    danger: 'border-rose-400/30 text-rose-300 hover:bg-rose-400/10',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl border px-4 py-2.5 text-sm transition-[background-color,border-color,box-shadow,transform] duration-200 active:translate-y-px ${colors[variant]} ${
        disabled ? 'cursor-not-allowed opacity-50' : ''
      }`}
    >
      {children}
    </button>
  );
}
