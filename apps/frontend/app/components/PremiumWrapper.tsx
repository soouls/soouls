'use client';

import { Lock } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type React from 'react';
import { trpc } from '../../src/utils/trpc';

import { Suspense } from 'react';

export function PremiumWrapper({
  children,
  showLockIcon = true,
}: { children: React.ReactNode; showLockIcon?: boolean }) {
  return (
    <Suspense fallback={<>{children}</>}>
      <PremiumWrapperContent showLockIcon={showLockIcon}>{children}</PremiumWrapperContent>
    </Suspense>
  );
}

function PremiumWrapperContent({
  children,
  showLockIcon = true,
}: { children: React.ReactNode; showLockIcon?: boolean }) {
  const { data: status, isLoading } = trpc.private.home.getOnboardingStatus.useQuery(undefined);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (isLoading) {
    return <div className="animate-pulse opacity-50">{children}</div>;
  }

  // Allow access if active premium or if trial is active
  const hasAccess = status?.planType === 'premium' || status?.isTrialActive;

  if (hasAccess) {
    return <>{children}</>;
  }

  const handleIntercept = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const params = new URLSearchParams(searchParams.toString());
    params.set('showPricing', 'true');
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="relative group w-full h-full" onClickCapture={handleIntercept}>
      <div className="pointer-events-none opacity-50 transition-opacity">{children}</div>
      {showLockIcon && (
        <div className="absolute top-0 right-0 -mt-2 -mr-2 bg-orange-100 text-orange-600 rounded-full p-1 shadow-sm z-10 opacity-80 group-hover:opacity-100 transition-opacity cursor-pointer">
          <Lock className="w-3 h-3" />
        </div>
      )}
    </div>
  );
}
