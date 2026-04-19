'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { trpc } from '../../src/utils/trpc';
import { CurveLoader } from '../components/CurveLoader';
import { AppTransition } from '../components/motion/AppTransition';

export default function DashboardRouteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();
  const { data, isLoading } = trpc.private.profile.getCurrent.useQuery(undefined, {
    enabled: isLoaded && isSignedIn,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn) {
      router.replace('/sign-in');
      return;
    }

    if (data && !data.onboardingCompletedAt) {
      router.replace('/onboarding');
    }
  }, [data, isLoaded, isSignedIn, router]);

  if (!isLoaded || !isSignedIn || isLoading || (data && !data.onboardingCompletedAt)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--app-bg)] text-[var(--app-text)]">
        <CurveLoader className="py-8" label="Aligning your universe" />
      </div>
    );
  }

  return <AppTransition>{children}</AppTransition>;
}
