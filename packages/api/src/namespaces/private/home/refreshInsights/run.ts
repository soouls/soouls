import { TRPCError } from '@trpc/server';
import type { Services, TrpcContext } from '../../../../router.js';

export async function run(_input: {}, ctx: TrpcContext, services: Services) {
  if (!ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return services.home.refreshInsights(ctx.userId);
}
