import type { EntryCanvasCard, EntryCanvasConnection } from '../../../../router.js';
import type { ProtectedContext, Services } from '../../../../trpc.js';
import type { Input } from './constants.js';

export function run(input: Input, ctx: ProtectedContext, services: Services) {
  return services.home.saveEntryCanvas(ctx.userId, {
    entryId: input.entryId,
    canvasTitle: input.canvasTitle,
    cards: input.cards as EntryCanvasCard[],
    connections: input.connections as EntryCanvasConnection[],
    clusterInsight: input.clusterInsight,
  });
}
