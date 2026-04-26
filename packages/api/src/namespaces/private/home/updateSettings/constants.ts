import { z } from 'zod';
import type { RateLimitConfig } from '../../../../rate-limit.js';

export const schema = z.object({
  themeMode: z.enum(['dark', 'light']).optional(),
  accentTheme: z.enum(['orange', 'yellow', 'green', 'purple']).optional(),
  defaultView: z.enum(['canvas', 'list', 'calendar']).optional(),
  writingMode: z.enum(['minimal', 'guided']).optional(),
  insightDepth: z.enum(['minimal', 'balanced', 'deep']).optional(),
  autoClustering: z.boolean().optional(),
  suggestions: z.boolean().optional(),
  autosave: z.boolean().optional(),
  focusMode: z.boolean().optional(),
  sessionTracking: z.boolean().optional(),
  dataStorage: z.enum(['local', 'cloud']).optional(),
  dataUsage: z.enum(['anonymous', 'full']).optional(),
  dailyReminder: z.boolean().optional(),
  reflectionPrompts: z.boolean().optional(),
  reminderTime: z.string().max(16).optional(),
});

export type Input = z.infer<typeof schema>;

export const config = {
  rateLimit: {
    maxRequests: 20,
    windowMs: 60_000,
  } satisfies RateLimitConfig,
} as const;
