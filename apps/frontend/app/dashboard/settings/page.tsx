'use client';

import { useClerk, useUser } from '@clerk/nextjs';
import { DashboardLayout } from '@soouls/ui-kit';
import Link from 'next/link';
import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { LogoutModal } from '../LogoutModal';
import { ProfileRail } from '../new-entry/dashboard/ProfileRail';
import { trpc } from '../../../src/utils/trpc';

export default function SettingsPage() {
  const { signOut } = useClerk();
  const { user } = useUser();
  const { data } = trpc.private.profile.getCurrent.useQuery(undefined);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await signOut({ redirectUrl: '/' });
    } finally {
      setIsLoggingOut(false);
      setLogoutOpen(false);
    }
  }

  return (
    <DashboardLayout
      headerLabel="Settings"
      profileSlot={
        <ProfileRail
          name={data?.name || data?.onboardingProfile?.displayName || user?.firstName || 'Unnamed traveler'}
          greeting="Hello there,"
          streakLabel="Your account, atmosphere, and access settings all live here."
          avatarUrl={user?.imageUrl}
          avatarSeed={data?.email || user?.id || 'soouls'}
        />
      }
      footerSlot={
        <button
          type="button"
          onClick={() => setLogoutOpen(true)}
          className="flex w-full items-center gap-3 rounded-[1.2rem] px-4 py-3 text-left text-red-500 transition hover:bg-white/5"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-urbanist text-xl font-medium">Logout</span>
        </button>
      }
    >
      <section className="grid gap-8 xl:grid-cols-[0.78fr_1.22fr]">
        <div
          id="account"
          className="rounded-[32px] border border-[var(--app-border)] bg-[var(--app-surface)] p-8 shadow-[0_24px_100px_-60px_var(--app-glow)]"
        >
          <p className="text-sm uppercase tracking-[0.28em] text-[var(--app-accent)]">Account</p>
          <h1 className="mt-4 font-editorial text-4xl text-[var(--app-text)]">
            Identity and access
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-7 text-[var(--app-text-muted)]">
            Clerk still handles the secure parts underneath, but the surface here is now fully
            custom. Resetting a password routes through the new recovery screen instead of the
            prebuilt Clerk account widget.
          </p>
        </div>

        <div className="grid gap-6">
          <div
            id="preferences"
            className="rounded-[32px] border border-[var(--app-border)] bg-[var(--app-surface)] p-8"
          >
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--app-text-muted)]">
              Profile
            </p>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--app-text-muted)]">
                  Name
                </p>
                <p className="mt-2 text-lg text-[var(--app-text)]">
                  {data?.name || data?.onboardingProfile?.displayName || 'Unnamed traveler'}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--app-text-muted)]">
                  Email
                </p>
                <p className="mt-2 text-lg text-[var(--app-text)]">{data?.email || 'Loading...'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--app-text-muted)]">
                  Atmosphere
                </p>
                <p className="mt-2 text-lg capitalize text-[var(--app-text)]">
                  {data?.onboardingProfile?.atmosphere?.replaceAll('_', ' ') || 'Signal tower'}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--app-text-muted)]">
                  Universe
                </p>
                <p className="mt-2 text-lg text-[var(--app-text)]">
                  {data?.onboardingProfile?.universeName || 'Still unnamed'}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-[var(--app-border)] bg-[var(--app-surface)] p-8">
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--app-text-muted)]">
              Security
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link
                href="/forgot-password"
                className="rounded-full bg-[var(--app-accent)] px-6 py-3 font-semibold text-[#120d0a]"
              >
                Reset password
              </Link>
              <button
                type="button"
                onClick={() => setLogoutOpen(true)}
                className="rounded-full border border-[var(--app-border)] px-6 py-3 text-[var(--app-text)] transition hover:bg-white/5"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </section>
      <LogoutModal
        open={logoutOpen}
        onStay={() => setLogoutOpen(false)}
        onLogout={() => void handleLogout()}
        isSubmitting={isLoggingOut}
      />
    </DashboardLayout>
  );
}
