import { useAuth } from '@clerk/clerk-expo';
import { QueryClientProvider } from '@tanstack/react-query';
import type React from 'react';
import { useMemo } from 'react';
import { queryClient, trpc, trpcClient } from '../utils/trpc';

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  console.log('[TRPCProvider] Rendering');
  const { getToken } = useAuth();
  console.log('[TRPCProvider] getToken type:', typeof getToken);
  const client = useMemo(() => trpcClient(getToken), [getToken]);

  console.log('[TRPCProvider] Returning Provider');
  return (
    <trpc.Provider client={client} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
