import React, { useMemo } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { QueryClientProvider } from '@tanstack/react-query';
import { trpc, trpcClient, queryClient } from '../utils/trpc';

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();
  const client = useMemo(() => trpcClient(getToken), [getToken]);

  return (
    <trpc.Provider client={client} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
