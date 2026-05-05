import { embed } from 'ai';
import { getOpenAiProvider } from '../env.js';

// Embedding utilities for vector search
export async function generateEmbedding(text: string): Promise<number[]> {
  const openai = getOpenAiProvider();

  if (!openai) {
    throw new Error('OPENAI_API_KEY environment variable is required for embeddings');
  }

  const { embedding } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: text,
  });
  return embedding;
}

export async function findSimilarEntries(
  _embedding: number[],
  _threshold = 0.8,
): Promise<string[]> {
  // Vector similarity search is handled by the database (pgvector)
  // This could be kept if we want to do some comparison in code, but mostly SQL
  return [];
}
