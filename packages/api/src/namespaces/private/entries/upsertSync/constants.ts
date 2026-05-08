import { z } from 'zod';
import type { RateLimitConfig } from '../../../../rate-limit.js';

export const schema = z.object({
  id: z.string().optional(),
  content: z.string(),
  type: z.enum(['entry', 'task']).optional(),
  finalize: z.boolean().optional(),
});

export const config = {
  rateLimit: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requests per minute for autosave/sync
  } satisfies RateLimitConfig,
} as const;
