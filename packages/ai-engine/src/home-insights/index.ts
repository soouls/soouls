import { generateObject } from 'ai';
import { z } from 'zod';
import { getOpenAiProvider } from '../env.js';

const homeInsightSchema = z.object({
  monthlyNarrative: z.string(),
  finalSynthesis: z.string(),
  reflectionPrompt: z.string(),
  writingProfileTitle: z.string(),
  writingProfileDescription: z.string(),
});

export type HomeInsightCopy = z.infer<typeof homeInsightSchema>;

export async function generateHomeInsightCopy(input: {
  userName: string;
  topThemes: string[];
  monthlyNarrativeFallback: string;
  finalSynthesisFallback: string;
  writingProfileTitleFallback: string;
  writingProfileDescriptionFallback: string;
}): Promise<HomeInsightCopy | null> {
  const openai = getOpenAiProvider();

  if (!openai) {
    return null;
  }

  try {
    const { object } = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: homeInsightSchema,
      prompt: [
        'You are writing reflective analytics copy for a journaling app named Soouls.',
        `User name: ${input.userName}`,
        `Top themes: ${input.topThemes.join(', ') || 'reflection, clarity'}`,
        `Fallback monthly narrative: ${input.monthlyNarrativeFallback}`,
        `Fallback final synthesis: ${input.finalSynthesisFallback}`,
        `Fallback writing profile title: ${input.writingProfileTitleFallback}`,
        `Fallback writing profile description: ${input.writingProfileDescriptionFallback}`,
        'Return elegant, emotionally intelligent copy grounded in the themes. Keep it specific, calm, and concise.',
      ].join('\n'),
    });

    return object;
  } catch {
    return null;
  }
}
