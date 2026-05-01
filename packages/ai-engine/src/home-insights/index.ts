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
  entriesText: string[];
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
        'Recent relevant journal entries:',
        ...input.entriesText.map(t => `- ${t.substring(0, 300)}`),
        `Fallback monthly narrative: ${input.monthlyNarrativeFallback}`,
        `Fallback final synthesis: ${input.finalSynthesisFallback}`,
        `Fallback writing profile title: ${input.writingProfileTitleFallback}`,
        `Fallback writing profile description: ${input.writingProfileDescriptionFallback}`,
        'Return elegant, emotionally intelligent copy grounded in the actual entries above. Keep it specific, calm, and concise.',
      ].join('\n'),
    });

    return object;
  } catch {
    return null;
  }
}

const clusterInsightSchema = z.object({
  narrative: z.string(),
  observation: z.string(),
  nextStep: z.string(),
  reflectionPrompt: z.string(),
  keyIdeas: z.array(z.object({
    label: z.string(),
    description: z.string()
  })).max(3),
});

export type ClusterInsightCopy = z.infer<typeof clusterInsightSchema>;

export async function generateClusterInsights(input: {
  clusterName: string;
  entriesText: string[];
}): Promise<ClusterInsightCopy | null> {
  const openai = getOpenAiProvider();
  if (!openai) return null;

  try {
    const { object } = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: clusterInsightSchema,
      prompt: [
        'You are an AI therapist/companion analyzing journal entries for a cluster.',
        `Cluster Theme: ${input.clusterName}`,
        'Recent relevant journal entries:',
        ...input.entriesText.map(t => `- ${t.substring(0, 300)}`),
        'Generate an emotionally intelligent narrative, observation, next step, and reflection prompt based on their real writings. Keep it empathetic and insightful.',
      ].join('\n'),
    });
    return object;
  } catch {
    return null;
  }
}
