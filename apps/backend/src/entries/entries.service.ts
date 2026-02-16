import { Injectable } from '@nestjs/common';
import { generateEmbedding } from '@soulcanvas/ai-engine/embeddings';
import { analyzeSentiment } from '@soulcanvas/ai-engine/sentiment';
import { db } from '@soulcanvas/database/client';
import { eq, sql } from '@soulcanvas/database/client';
import { canvasNodes, journalEntries } from '@soulcanvas/database/schema';

@Injectable()
export class EntriesService {
  async createEntry(userId: string, content: string, type: 'entry' | 'task' = 'entry') {
    // 1. Generate Embedding
    const embedding = await generateEmbedding(content);

    // 2. Analyze Sentiment
    const sentiment = await analyzeSentiment(content);

    // 3. Store in Database
    const [entry] = await db
      .insert(journalEntries)
      .values({
        userId,
        content,
        type,
        embedding,
        sentimentScore: sentiment.score,
        sentimentLabel: sentiment.label,
        sentimentColor: sentiment.color,
      })
      .returning();

    // 4. Initial Node Placement (Simplified: Randomize or place near similar nodes)
    // For now, let's find the most similar node and place near it
    const similarNodes = await this.findSimilarEntries(embedding, userId, 1);

    let x = Math.random() * 10 - 5;
    let y = Math.random() * 10 - 5;
    let z = Math.random() * 10 - 5;

    if (similarNodes.length > 0) {
      const [parentNode] = await db
        .select()
        .from(canvasNodes)
        .where(eq(canvasNodes.entryId, similarNodes[0].id))
        .limit(1);

      if (parentNode) {
        x = parentNode.x + (Math.random() - 0.5) * 2;
        y = parentNode.y + (Math.random() - 0.5) * 2;
        z = parentNode.z + (Math.random() - 0.5) * 2;
      }
    }

    await db.insert(canvasNodes).values({
      entryId: entry.id,
      x,
      y,
      z,
      visualMass: type === 'task' ? 2.0 : 1.0,
      emotion: sentiment.label,
    });

    return entry;
  }

  async findSimilarEntries(
    embedding: number[],
    userId: string,
    limit = 5,
  ): Promise<Array<{ id: string }>> {
    // Use raw SQL for vector similarity to avoid type issues with pgvector operator
    const embeddingString = JSON.stringify(embedding);
    const rows = await db.execute(sql`
            SELECT * FROM ${journalEntries}
            WHERE ${journalEntries.userId} = ${userId}
            ORDER BY ${journalEntries.embedding} <=> ${embeddingString}::vector
            LIMIT ${limit}
        `);
    return rows as unknown as Array<{ id: string }>;
  }

  async getGalaxyData(userId: string) {
    return db
      .select({
        id: journalEntries.id,
        content: journalEntries.content,
        type: journalEntries.type,
        sentimentColor: journalEntries.sentimentColor,
        sentimentLabel: journalEntries.sentimentLabel,
        x: canvasNodes.x,
        y: canvasNodes.y,
        z: canvasNodes.z,
        visualMass: canvasNodes.visualMass,
      })
      .from(journalEntries)
      .innerJoin(canvasNodes, eq(journalEntries.id, canvasNodes.entryId))
      .where(eq(journalEntries.userId, userId));
  }
}
