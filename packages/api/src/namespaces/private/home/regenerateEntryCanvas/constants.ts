import { z } from 'zod';
import type { RateLimitConfig } from '../../../../rate-limit.js';

export const schema = z.object({
  entryId: z.string().uuid(),
});

export type Input = z.infer<typeof schema>;

export const config = {
  rateLimit: {
    maxRequests: 10,
    windowMs: 60_000,
  } satisfies RateLimitConfig,
} as const;
