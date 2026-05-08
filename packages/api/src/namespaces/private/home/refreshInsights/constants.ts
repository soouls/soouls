import { z } from 'zod';
import type { RateLimitConfig } from '../../../trpc.js';

export const schema = z.object({});

export const config: { rateLimit: RateLimitConfig } = {
  rateLimit: {
    windowMs: 60 * 1000, // 1 minute
    max: 5, // 5 refreshes per minute
    message: 'You are refreshing insights too frequently. Please wait a moment.',
  },
};
