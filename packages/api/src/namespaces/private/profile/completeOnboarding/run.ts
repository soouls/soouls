import type { ProtectedContext, Services } from '../../../../trpc.js';
import type { Input } from './constants.js';

export async function run(input: Input, ctx: ProtectedContext, services: Services) {
  return services.profile.completeOnboarding(ctx.userId, {
    purpose: input.purpose,
    expressionStyle: input.expressionStyle,
    atmosphere: input.atmosphere,
    thinkingRhythm: input.thinkingRhythm,
    companionTone: input.companionTone,
    successDefinition: input.successDefinition ?? null,
    journalContext: input.journalContext ?? null,
    displayName: input.displayName,
    universeName: input.universeName,
    firstEntry: input.firstEntry,
  });
}
