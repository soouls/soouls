import { generateObject } from 'ai';
import { z } from 'zod';
import { getOpenAiProvider } from '../env.js';

const homeInsightSchema = z.object({
  // Box 1
  quote: z.string(),
  highlighted_phrases: z.array(z.string()),
  stat_line: z.string(),
  stat_note: z.string(),
  dominant_theme: z.string(),
  previous_theme: z.string(),
  
  // Box 2
  themes: z.array(z.object({
    label: z.string(),
    count: z.number(),
    percentage: z.number(),
  })).max(6),

  // Box 3
  reflectionToneDescription: z.string(),
  
  // Box 4
  relationshipMap: z.object({
    nodes: z.array(z.object({ 
      id: z.string(), 
      label: z.string(), 
      weight: z.number()
    })),
    connections: z.array(z.object({ 
      from: z.string(), 
      to: z.string(), 
      strength: z.number()
    })),
  }),

  // Box 5
  patterns: z.array(z.object({
    label: z.string(),
    status: z.enum(['increasing', 'decreasing', 'emerging', 'resolved']),
    note: z.string().nullable(),
  })).max(5),

  // Box 6
  finalSynthesis: z.object({
    headline: z.string(),
    body: z.string(),
  }),
});

export type HomeInsightCopy = z.infer<typeof homeInsightSchema>;

export async function generateHomeInsightCopy(input: {
  userName: string;
  entries: { text: string; date: string; wordCount: number }[];
  firstHalf: string[];
  secondHalf: string[];
  peakTimeSlot: string;
  peakTimeEntries: string[];
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
        'System: You are an introspective journal analyst. Analyse the user\'s journal entries and return ONLY valid JSON, no markdown, no extra text.',
        `User: Here are all the journal entries for this month: ${JSON.stringify(input.entries)}`,
        `Comparison Context:`,
        `First half of month: ${JSON.stringify(input.firstHalf)}`,
        `Second half of month: ${JSON.stringify(input.secondHalf)}`,
        `Date range: ${new Date().toLocaleString('en-US', { month: 'long' })} 1st to ${new Date().toLocaleDateString()}`,
        `Total entries: ${input.entries.length}`,
        `The user writes most during: ${input.peakTimeSlot}`,
        `Sample entries from peak time: ${JSON.stringify(input.peakTimeEntries)}`,
        'Return this exact JSON structure:',
        '{',
        '  "quote": "One sentence (max 20 words) summarising the month\'s dominant mental theme, written in second person",',
        '  "highlighted_phrases": ["phrase1", "phrase2"],',
        '  "stat_line": "One concrete stat derived from entries, e.g. \'35% increase in goal-oriented thinking\'",',
        '  "stat_note": "One supporting sentence explaining the stat in plain language",',
        '  "dominant_theme": "single word label, e.g. Clarity",',
        '  "previous_theme": "single word label for what it evolved from, e.g. Exploration",',
        '  "themes": [{ "label": "CAREER", "count": 16, "percentage": 80 }], // Max 6, ALL CAPS labels',
        '  "reflectionToneDescription": "Write ONE sentence (max 20 words) describing the quality or tone of their peak-time writing based on the peak time samples provided.",',
        '  "relationshipMap": { "nodes": [{ "id": "career", "label": "CAREER", "weight": 16 }], "connections": [{ "from": "career", "to": "anxiety", "strength": 0.8 }] },',
        '  "patterns": [{ "label": "CAREER ANXIETY", "status": "decreasing", "note": "optional 5 word explanation" }],',
        '  "finalSynthesis": { "headline": "A 3-5 word headline", "body": "A 2-sentence synthesis of the entire month" }',
        '}',
        'Rules for Box 4 (Relationship Map): weight = frequency (1-20), strength = co-occurrence (0.0-1.0). Max 6 nodes.',
        'Rules for Box 5 (Evolution Cycle): Split entries early-month vs late-month. Status: increasing | decreasing | emerging | resolved.',
      ].join('\n'),
    });

    return object;
  } catch (err) {
    console.error('[AI Engine] Failed to generate home insight copy:', err);
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
  } catch (err) {
    console.error('[AI Engine] Failed to generate cluster insights:', err);
    return null;
  }
}
