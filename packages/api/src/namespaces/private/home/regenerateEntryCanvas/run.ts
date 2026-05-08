import type { ProtectedContext, Services } from '../../../../trpc.js';
import type { Input } from './constants.js';

export function run(input: Input, ctx: ProtectedContext, services: Services) {
  return services.home.regenerateEntryCanvas(ctx.userId, input.entryId);
}
