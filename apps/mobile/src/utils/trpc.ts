import type { AppRouter } from '@soouls/api/router';
import { QueryClient } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';

export const trpc = createTRPCReact<AppRouter>();

import { Platform } from 'react-native';

export function getBaseUrl() {
  // Use localhost for iOS simulator, 10.0.2.2 for Android emulator
  // For physical devices, you must use your local IP address
  if (typeof process !== 'undefined' && process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  return Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
}

export const queryClient = new QueryClient();

export const trpcClient = (getToken: () => Promise<string | null>) =>
  trpc.createClient({
    links: [
      httpBatchLink({
        url: `${getBaseUrl()}/trpc`,
        async headers() {
          const token = await getToken();
          return {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          };
        },
      }),
    ],
  });
