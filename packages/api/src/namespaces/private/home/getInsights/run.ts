import type { ProtectedContext, Services } from '../../../../trpc.js';
import type { Input } from './constants.js';

export async function run(_input: Input, ctx: ProtectedContext, services: Services) {
  try {
    console.log('[getInsights] Fetching insights for user:', ctx.userId);
    const result = await services.home.getInsights(ctx.userId);
    console.log('[getInsights] Successfully fetched insights');
    return result;
  } catch (err) {
    console.error('[getInsights] Error fetching insights:', err);
    console.error('[getInsights] Stack:', err instanceof Error ? err.stack : 'No stack');
    throw err;
  }
}