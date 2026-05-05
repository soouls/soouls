import { z } from 'zod';
import type { RateLimitConfig } from '../../../../rate-limit.js';

export const schema = z.void().optional();

export type Input = z.infer<typeof schema>;

export const config = {
  rateLimit: {
    maxRequests: 3,
    windowMs: 60_000,
  } satisfies RateLimitConfig,
} as const;
