// Emotion scoring and analysis functions

export interface EmotionScore {
  emotion: string;
  score: number;
}

/**
 * Calculate emotion score from text content
 * This is a pure function that can run in browser or server
 */
export function calculateEmotionScore(text: string): EmotionScore[] {
  // Simple keyword-based scoring (can be replaced with ML model)
  const emotions: Record<string, string[]> = {
    happy: ['happy', 'joy', 'excited', 'great', 'wonderful', 'amazing'],
    sad: ['sad', 'down', 'depressed', 'unhappy', 'disappointed'],
    anxious: ['anxious', 'worried', 'nervous', 'stressed', 'overwhelmed'],
    calm: ['calm', 'peaceful', 'relaxed', 'serene', 'content'],
    angry: ['angry', 'frustrated', 'mad', 'irritated', 'annoyed'],
  };

  const scores: EmotionScore[] = [];
  const lowerText = text.toLowerCase();

  for (const [emotion, keywords] of Object.entries(emotions)) {
    const matches = keywords.filter((keyword) => lowerText.includes(keyword)).length;
    if (matches > 0) {
      scores.push({
        emotion,
        score: matches / keywords.length,
      });
    }
  }

  return scores.sort((a, b) => b.score - a.score);
}
