import type { ProtectedContext, Services } from '../../../../trpc.js';
import type { Input } from './constants.js';

export async function run(input: Input, ctx: ProtectedContext, services: Services) {
  return services.home.updateSettings(ctx.userId, input);
}
