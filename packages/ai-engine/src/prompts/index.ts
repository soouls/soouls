export const reflectionPrompts = {
  moodWeaving: (entries: string[]) =>
    `Analyze these journal entries and identify emotional patterns:\n${entries.join('\n\n')}\n\nProvide insights about recurring themes and emotional connections.`,

  reflection: (entry: string) =>
    `Based on this journal entry, provide thoughtful reflection questions:\n\n${entry}\n\nGenerate 3-5 questions that encourage deeper self-reflection.`,
};
