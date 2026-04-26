import type { ProtectedContext, Services } from '../../../../trpc.js';
import type { Input } from './constants.js';

export async function run(_input: Input, ctx: ProtectedContext, services: Services) {
  return services.home.getSettings(ctx.userId);
}
