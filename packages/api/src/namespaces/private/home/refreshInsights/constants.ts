import { z } from 'zod';
import type { RateLimitConfig } from '../../../../rate-limit.js';

export const schema = z.object({});

export const config: { rateLimit: RateLimitConfig } = {
  rateLimit: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5, // 5 refreshes per minute
  },
};
