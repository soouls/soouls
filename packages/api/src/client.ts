import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from './router';

export function createTRPCClient(url: string) {
  return createTRPCProxyClient<AppRouter>({
    links: [
      httpBatchLink({
        url,
      }),
    ],
  });
}
