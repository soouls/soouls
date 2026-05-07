import { z } from 'zod';
import type { RateLimitConfig } from '../../../../rate-limit.js';

const cardSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['idea', 'quote', 'emotion', 'question', 'warning', 'reflection']),
  title: z.string().max(160),
  body: z.string().max(1600),
  x: z.number().finite(),
  y: z.number().finite(),
  width: z.number().finite().min(120).max(420),
  height: z.number().finite().min(80).max(320),
  color: z.string().max(32),
  border_color: z.string().max(32),
  tag: z.string().max(80).optional(),
});

const connectionSchema = z.object({
  id: z.string().optional(),
  from: z.string().min(1),
  to: z.string().min(1),
  label: z.string().max(80).optional(),
});

export const schema = z.object({
  entryId: z.string().uuid(),
  canvasTitle: z.string().min(1).max(160),
  cards: z.array(cardSchema).max(16),
  connections: z.array(connectionSchema).max(32),
  clusterInsight: z.string().max(600).optional(),
});

export type Input = z.infer<typeof schema>;

export const config = {
  rateLimit: {
    maxRequests: 60,
    windowMs: 60_000,
  } satisfies RateLimitConfig,
} as const;
