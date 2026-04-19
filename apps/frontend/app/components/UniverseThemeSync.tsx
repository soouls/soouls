'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect } from 'react';
import { trpc } from '../../src/utils/trpc';
import { DEFAULT_ATMOSPHERE, applyAtmosphereTheme } from './profile-theme';

export function UniverseThemeSync() {
  const { isLoaded, isSignedIn } = useUser();
  const { data } = trpc.private.profile.getCurrent.useQuery(undefined, {
    enabled: isLoaded && isSignedIn,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      applyAtmosphereTheme(DEFAULT_ATMOSPHERE);
      return;
    }

    applyAtmosphereTheme(data?.onboardingProfile?.atmosphere ?? data?.themePreference ?? null);
  }, [data?.onboardingProfile?.atmosphere, data?.themePreference, isLoaded, isSignedIn]);

  return null;
}
