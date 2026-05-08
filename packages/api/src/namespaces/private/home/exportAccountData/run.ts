import type { ProtectedContext, Services } from '../../../../trpc.js';

export function run(_input: unknown, ctx: ProtectedContext, services: Services) {
  return services.home.exportAccountData(ctx.userId);
}
