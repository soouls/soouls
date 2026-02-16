import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from './router.js';

export function createTRPCClient(url: string) {
  return createTRPCProxyClient<AppRouter>({
    links: [
      httpBatchLink({
        url,
      }),
    ],
  });
}
