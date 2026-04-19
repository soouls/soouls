import { z } from 'zod';
import type { RateLimitConfig } from '../../../../rate-limit.js';

export const schema = z.object({
  purpose: z.enum(['clear_my_mind', 'track_habits', 'process_emotions', 'creative_writing']),
  expressionStyle: z.enum(['flowing_streams', 'guided_steps', 'voice_bursts', 'mixed_media']),
  atmosphere: z.enum(['clear_horizon', 'living_archive', 'signal_tower', 'depth_chamber']),
  thinkingRhythm: z.enum(['first_thing', 'whenever_it_hits', 'after_the_noise', 'late_at_night']),
  companionTone: z.enum(['silent', 'gentle', 'honest', 'deep']),
  successDefinition: z.string().trim().max(500).nullable().optional(),
  journalContext: z.string().trim().max(500).nullable().optional(),
  displayName: z.string().trim().min(1).max(80),
  universeName: z.string().trim().min(1).max(120),
  firstEntry: z.string().trim().min(1).max(5000),
});

export type Input = z.infer<typeof schema>;

export const config = {
  rateLimit: {
    maxRequests: 15,
    windowMs: 60_000,
  } satisfies RateLimitConfig,
} as const;
