'use client';

import { Bell, Search } from 'lucide-react';
import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
  userActionSlot?: ReactNode;
  profileSlot?: ReactNode;
  footerSlot?: ReactNode;
  headerLabel?: string;
}

export function DashboardLayout({
  children,
  userActionSlot,
  profileSlot,
  footerSlot,
  headerLabel = 'Dashboard',
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)] selection:bg-[var(--app-accent-soft)]">
      <Sidebar profileSlot={profileSlot} footerSlot={footerSlot} />

      <main className="lg:pl-[288px]">
        {/* Header */}
        <header
          className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-white/6 px-6 backdrop-blur-xl sm:px-8"
          style={{ backgroundColor: 'color-mix(in srgb, var(--app-bg) 88%, transparent)' }}
        >
          <div className="flex items-center gap-4 text-[var(--app-text-muted)]">
            <span className="font-clarity text-sm uppercase tracking-[0.28em]">{headerLabel}</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              type="button"
              className="text-[var(--app-text-muted)] transition-colors hover:text-[var(--app-text)]"
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="relative text-[var(--app-text-muted)] transition-colors hover:text-[var(--app-text)]"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[var(--app-accent)]" />
            </button>
            <div className="h-8 w-px bg-[var(--app-border)]" />
            {userActionSlot}
          </div>
        </header>

        <div className="mx-auto max-w-7xl space-y-8 p-6 sm:p-8">{children}</div>
      </main>
    </div>
  );
}
