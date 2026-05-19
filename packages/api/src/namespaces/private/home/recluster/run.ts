import type { ProtectedContext, Services } from '../../../../trpc.js';

export async function run(_input: unknown, ctx: ProtectedContext, services: Services) {
  return await services.home.recluster(ctx.userId);
}
