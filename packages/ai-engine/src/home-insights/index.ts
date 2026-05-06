import { generateObject } from 'ai';
import { z } from 'zod';
import { getOpenAiProvider } from '../env.js';

const homeInsightSchema = z.object({
  monthlyQuote: z.string(),
  monthlyAnalysis: z.string(),
  statLine: z.string(),
  statNote: z.string(),
  dominantTheme: z.string(),
  previousTheme: z.string(),
  finalSynthesis: z.object({
    headline: z.string(),
    body: z.string(),
  }),
  reflectionPrompt: z.string(),
  writingProfileTitle: z.string(),
  writingProfileDescription: z.string(),
  writingProfileTags: z.array(z.string()).max(3),
  coreThemes: z
    .array(
      z.object({
        label: z.string(),
        percent: z.number(),
      }),
    )
    .max(3),
  reflectionToneDescription: z.string(),
  relationshipMap: z.object({
    nodes: z.array(z.object({ id: z.string(), label: z.string(), size: z.number() })),
    links: z.array(z.object({ source: z.string(), target: z.string(), strength: z.number() })),
  }),
  thinkingShifts: z
    .array(
      z.object({
        label: z.string(),
        trend: z.enum(['up', 'down', 'circle']).nullable(),
        tag: z.string().nullable(),
      }),
    )
    .max(5),
});

export type HomeInsightCopy = z.infer<typeof homeInsightSchema>;

export type InsightEntryMeta = {
  text: string;
  timestamp: string;
  wordCount: number;
  dayOfWeek: string;
  hourOfDay: number;
};

export async function generateHomeInsightCopy(input: {
  userName: string;
  topThemes: string[];
  entries: InsightEntryMeta[];
  totalEntryCount: number;
  dateRangeStart: string;
  dateRangeEnd: string;
  peakWritingTime: string;
  weeklyEntryCount: number;
  previousWeeklyEntryCount: number;
  currentStreak: number;
  monthlyQuoteFallback: string;
  monthlyAnalysisFallback: string;
  finalSynthesisFallback: string;
  writingProfileTitleFallback: string;
  writingProfileDescriptionFallback: string;
}): Promise<HomeInsightCopy | null> {
  const openai = getOpenAiProvider();

  if (!openai) {
    return null;
  }

  const entryCount = input.totalEntryCount;

  // Build entry context — send up to 50 entries with metadata
  const entryLines = input.entries
    .slice(0, 50)
    .map(
      (e, i) =>
        `Entry ${i + 1} [${e.timestamp}, ${e.dayOfWeek}, ${e.hourOfDay}:00, ${e.wordCount} words]: ${e.text.substring(0, 250)}`,
    );

  // Determine edge-case instructions
  let edgeCaseNote = '';
  if (entryCount === 0) {
    edgeCaseNote =
      'The user has ZERO entries. Return generic encouraging copy. statLine should be empty. All themes should be empty arrays.';
  } else if (entryCount === 1) {
    edgeCaseNote =
      'The user has only 1 entry. Base everything on that single entry. Omit statLine (set to empty string). Cannot calculate percentage changes. All thinkingShifts should have trend null and tag "EMERGING". relationshipMap should have max 1-2 nodes.';
  } else if (entryCount <= 4) {
    edgeCaseNote = `The user has only ${entryCount} entries. Provide insights but keep them tentative. statLine can reference raw counts instead of percentages.`;
  }

  try {
    const { object } = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: homeInsightSchema,
      prompt: [
        'You are an introspective journal analyst for a journaling app named Soouls.',
        `User name: ${input.userName}`,
        `Date range: ${input.dateRangeStart} to ${input.dateRangeEnd}`,
        `Total entries this period: ${entryCount}`,
        `Entries this week: ${input.weeklyEntryCount}`,
        `Entries last week: ${input.previousWeeklyEntryCount}`,
        `Current streak: ${input.currentStreak} days`,
        `Peak writing time: ${input.peakWritingTime}`,
        `Detected themes from keyword analysis: ${input.topThemes.join(', ') || 'none detected yet'}`,
        '',
        '=== JOURNAL ENTRIES ===',
        ...entryLines,
        '',
        edgeCaseNote ? `=== EDGE CASE ===\n${edgeCaseNote}\n` : '',
        '=== INSTRUCTIONS ===',
        '',
        'BOX 1 — MONTHLY SUMMARY QUOTE:',
        '- monthlyQuote: One sentence (max 25 words) summarising the dominant mental theme this period. Written in second person. MUST reference specific topics/words from the actual entries above.',
        '- Wrap 2-3 key phrases in {ts1}phrase{/ts1} to highlight them in orange.',
        '- monthlyAnalysis: One sentence providing context. Wrap the key stat/number in {ts2}stat{/ts2}.',
        '- statLine: One concrete stat derived from the entries (e.g. "35% increase in goal-oriented thinking"). Empty string if only 1 entry.',
        '- statNote: One supporting sentence explaining the stat. Empty string if statLine is empty.',
        '- dominantTheme: Single word label for the current dominant theme (e.g. "Clarity", "Discipline").',
        '- previousTheme: Single word label for what the theme evolved from (e.g. "Exploration", "Anxiety").',
        '',
        'BOX 4 — RELATIONSHIP MAP:',
        '- relationshipMap.nodes: Top concepts/themes as nodes. Max 6 nodes. id: lowercase slug, label: ALL CAPS, size: 1-10 based on frequency.',
        '- relationshipMap.links: Connections between nodes. source/target match node ids. strength: 0.0-1.0 based on how often they appear together in the same entry. Only include connections with strength > 0.3.',
        '',
        'BOX 5 — EVOLUTION CYCLE:',
        '- thinkingShifts: Compare patterns from earlier entries vs later entries. Max 5 patterns.',
        '- status: "up" (increasing), "down" (decreasing), "circle" (resolved/steady).',
        '- tag: "EMERGING" only if pattern appeared only in recent entries. null otherwise.',
        '- label: ALL CAPS, 2-3 words max.',
        '',
        'BOX 6 — FINAL SYNTHESIS:',
        '- finalSynthesis.headline: Max 12 words. The single most important insight from ALL the analysis above. Must be genuinely derived from entries, not generic.',
        '- finalSynthesis.body: Max 30 words. Supporting context derived from the entries.',
        '',
        'OTHER FIELDS:',
        '- reflectionToneDescription: One sentence (max 15 words) describing the emotional vibe of their entries.',
        '- reflectionPrompt: A thoughtful question to prompt deeper reflection.',
        '- writingProfileTitle: 2-4 word title for their writing style.',
        '- writingProfileDescription: One sentence describing their writing approach.',
        '- writingProfileTags: Array of 1-3 word strings describing their style (max 3).',
        '- coreThemes: Array of max 3 objects { label: string, percent: number }. Label must be a theme derived from entries. Percentages should roughly add up to 100.',
        '',
        'CRITICAL RULES:',
        '- Every quote, theme, label, and stat MUST be grounded in the actual journal entries provided above.',
        '- If entries are about cooking, insights must be about cooking — never generic "growth" language.',
        '- Do NOT invent topics not present in the entries.',
        '- Keep language calm, specific, and emotionally intelligent.',
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
  keyIdeas: z
    .array(
      z.object({
        label: z.string(),
        description: z.string(),
      }),
    )
    .max(3),
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
        ...input.entriesText.map((t) => `- ${t.substring(0, 300)}`),
        'Generate an emotionally intelligent narrative, observation, next step, and reflection prompt based on their real writings. Keep it empathetic and insightful.',
      ].join('\n'),
    });
    return object;
  } catch {
    return null;
  }
}
