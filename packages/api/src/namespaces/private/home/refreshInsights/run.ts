import type { Services, TrpcContext } from '../../../../router.js';

export async function run(_input: {}, ctx: TrpcContext, services: Services) {
  return services.home.refreshInsights(ctx.userId!);
}
