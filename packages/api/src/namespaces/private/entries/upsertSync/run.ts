import { TRPCError } from '@trpc/server';
import type { z } from 'zod';
import type { Services, TrpcContext } from '../../../../router.js';
import type { schema } from './constants.js';

type UpsertSyncInput = z.infer<typeof schema> & { content: string };

export async function run(input: z.infer<typeof schema>, ctx: TrpcContext, services: Services) {
  if (!ctx.userId) {
    throw new Error('Unauthorized');
  }

  if (typeof input.content !== 'string') {
    throw new Error('Entry content is required');
  }

  try {
    return await services.entries.upsertSync(ctx.userId, input as UpsertSyncInput);
  } catch (error) {
    console.warn('Entry sync failed:', error instanceof Error ? error.message : error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Entry cloud save failed. Your local draft is still safe.',
    });
  }
}
