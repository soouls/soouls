import { createHash } from 'node:crypto';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Inject, Injectable } from '@nestjs/common';
import { generateEmbedding } from '@soouls/ai-engine/embeddings';
import { analyzeSentiment } from '@soouls/ai-engine/sentiment';
import type { EntryKind, GalaxyEntry, UserEntry } from '@soouls/api/router';
import { db } from '@soouls/database/client';
import { and, desc, eq, sql } from '@soouls/database/client';
import { canvasNodes, journalEntries, users } from '@soouls/database/schema';
import LZString from 'lz-string';
import type { RedisService } from '../redis/redis.service';
import { decryptData, encryptData } from '../utils/encryption';

const s3 = new S3Client({
  region: 'auto',
  endpoint:
    process.env.CLOUDFLARE_R2_ENDPOINT ||
    (process.env.R2_ACCOUNT_ID
      ? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
      : undefined),
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
    secretAccessKey:
      process.env.R2_SECRET_ACCESS_KEY || process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
  },
});

const MEDIA_CONTENT_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'audio/webm',
  'audio/mpeg',
  'audio/mp4',
  'audio/wav',
  'audio/ogg',
]);

type EntryAnalysis = {
  sentiment: { score: number; label: string; color: string } | null;
  embedding: number[] | null;
};

type DerivedEntryFields = {
  title: string | null;
  wordCount: number;
  taskStatus: string | null;
  mediaUrl: string | null;
  attachments: EntryMediaAttachment[];
  metadata: EntryMetadata;
  extractedText: string;
};

type PersistedEntryContent = {
  plainContent: string;
};

type EntryMediaAttachment = {
  blockId: string | null;
  type: 'image' | 'voice' | 'doodle';
  url: string;
  storageKey: string | null;
  contentType: string | null;
  byteSize: number | null;
  sha256: string | null;
  name: string | null;
  duration: number | null;
  uploadedAt: string | null;
};

type EntryMetadata = {
  media: {
    count: number;
    sha256: string[];
    storageKeys: string[];
    byteSizeTotal: number;
  };
};

@Injectable()
export class EntriesService {
  private readonly CACHE_TTL = {
    ENTRY: 3600,
    ENTRIES_ALL: 1800,
    GALAXY: 3600,
  };

  constructor(private readonly redis: RedisService) {}

  private getCacheKey(prefix: string, ...parts: (string | number)[]): string {
    return `${prefix}:${parts.join(':')}`;
  }

  private getEntryCacheKey(userId: string, entryId: string): string {
    return this.getCacheKey('entry', userId, entryId);
  }

  private async getUserVersion(userId: string): Promise<string> {
    const versionKey = this.getCacheKey('user', userId, 'ns_version');
    const version = await this.redis.get<string>(versionKey);
    if (version) return version;

    // Initialize version if not exists
    const newVersion = '1';
    await this.redis.set(versionKey, newVersion, 86400 * 30); // 30 day version life
    return newVersion;
  }

  private async invalidateUserEntryCache(userId: string): Promise<void> {
    const versionKey = this.getCacheKey('user', userId, 'ns_version');
    await this.redis.set(versionKey, Date.now().toString(), 86400 * 30);

    // Invalidate admin entries cache (still uses pattern as it's global/rare)
    await Promise.all([
      this.redis.invalidatePattern('admin:entries:*'),
      this.redis.invalidatePattern(`entries:all:${userId}:*`),
      this.redis.invalidatePattern(`galaxy:${userId}:*`),
      this.redis.invalidatePattern(`home:*:${userId}*`),
    ]);
  }

  /**
   * Internal helper to decrypt, decompress and parse entry content.
   * Handles legacy plain text, encrypted text, and compressed JSON blocks.
   */
  private processEntryContent(rawContent: string, userId: string): { text: string; full: any } {
    if (!rawContent) return { text: '', full: null };

    // 1. Decrypt if needed
    const decrypted = decryptData(rawContent, userId);

    // 2. Try decompression (new standard)
    let processed = decrypted;
    try {
      const decompressed =
        LZString.decompressFromBase64(decrypted) || LZString.decompressFromUTF16(decrypted);
      if (decompressed) {
        processed = decompressed;
      }
    } catch {
      // Not compressed, proceed with raw decrypted
    }

    // 3. Try parsing as JSON (block editor format)
    try {
      const parsed = JSON.parse(processed);
      if (parsed && typeof parsed === 'object') {
        return {
          text: this.buildEntryText(parsed),
          full: parsed,
        };
      }
    } catch {
      // Not JSON, likely plain text
    }

    return { text: processed, full: null };
  }

  decodeEntryContent(rawContent: string, userId: string): { text: string; full: any } {
    return this.processEntryContent(rawContent, userId);
  }

  private extractTextFromRawContent(rawContent: string): { text: string; full: any } {
    if (!rawContent) return { text: '', full: null };

    let normalizedContent = rawContent;
    try {
      const decompressed =
        LZString.decompressFromBase64(rawContent) || LZString.decompressFromUTF16(rawContent);
      if (decompressed?.trim().match(/^[{[]/u)) {
        normalizedContent = decompressed;
      }
    } catch {
      // Autosave payload may already be plain text or plain JSON.
    }

    try {
      const parsed = JSON.parse(normalizedContent);
      if (parsed && typeof parsed === 'object') {
        return {
          text: this.buildEntryText(parsed),
          full: parsed,
        };
      }
    } catch {
      // Plain text payload, keep as-is.
    }

    return { text: normalizedContent, full: null };
  }

  private buildEntryText(parsed: any): string {
    const textContent = typeof parsed?.textContent === 'string' ? parsed.textContent.trim() : '';
    const title = typeof parsed?.title === 'string' ? parsed.title.trim() : '';
    const blocks = Array.isArray(parsed?.blocks) ? parsed.blocks : [];
    const blockText = blocks.flatMap((block: any) => this.blockToText(block));

    return [textContent, ...blockText].filter(Boolean).join('\n\n').trim() || title;
  }

  private blockToText(block: any): string[] {
    if (!block) return [];
    if (block.type === 'paragraph') return [block.content || ''];
    if (block.type === 'tasklist') {
      return [
        block.title || '',
        ...(block.tasks || []).map((t: any) => `- [${t.done ? 'x' : ' '}] ${t.text || ''}`),
      ];
    }
    if (block.type === 'goal') return [block.goal || '', block.label || ''];
    if (block.type === 'image') return [block.name || block.alt || ''];
    if (block.type === 'voice') return [block.title || 'voice note'];
    if (block.type === 'doodle') return [block.title || 'doodle'];
    return [];
  }

  private deriveEntryFields(rawContent: string, type: 'entry' | 'task'): DerivedEntryFields {
    const { text, full } = this.extractTextFromRawContent(rawContent);
    const normalizedText = text.trim();
    const firstMeaningfulLine =
      normalizedText
        .split('\n')
        .map((line) => line.trim())
        .find(Boolean) ?? '';
    const title = firstMeaningfulLine ? firstMeaningfulLine.slice(0, 96) : null;
    const wordCount = normalizedText.split(/\s+/).filter(Boolean).length;

    let taskStatus: string | null = null;
    if (type === 'task') {
      const taskLists = Array.isArray(full?.blocks)
        ? full.blocks.filter((block: any) => block?.type === 'tasklist')
        : [];

      if (taskLists.length > 0) {
        const tasks = taskLists.flatMap((block: any) => block.tasks || []);
        taskStatus =
          tasks.length > 0 && tasks.every((task: any) => task.done) ? 'completed' : 'pending';
      } else {
        taskStatus = 'pending';
      }
    }

    // Extract first image URL for mediaUrl column
    const attachments = this.extractEntryAttachments(full);
    let mediaUrl: string | null = null;
    const firstImageAttachment = attachments.find((attachment) => attachment.type === 'image');
    if (firstImageAttachment) {
      mediaUrl = firstImageAttachment.url;
    } else if (full?.blocks && Array.isArray(full.blocks)) {
      const imageBlock = full.blocks.find(
        (b: any) => b.type === 'image' && (b.dataUrl || b.url || b.src),
      );
      if (imageBlock) {
        mediaUrl = imageBlock.dataUrl || imageBlock.url || imageBlock.src;
      }
    }

    return {
      title,
      wordCount,
      taskStatus,
      mediaUrl,
      attachments,
      metadata: this.buildEntryMetadata(attachments),
      extractedText: normalizedText,
    };
  }

  private async analyzeEntryText(text: string): Promise<EntryAnalysis> {
    if (!text) return { sentiment: null, embedding: null };

    try {
      const [sentiment, embedding] = await Promise.all([
        analyzeSentiment(text),
        generateEmbedding(text),
      ]);
      return { sentiment, embedding };
    } catch (err) {
      console.warn('AI analysis failed for entry:', err);
      return { sentiment: null, embedding: null };
    }
  }

  private buildCanvasPosition(derived: DerivedEntryFields, sentiment: EntryAnalysis['sentiment']) {
    const hour = new Date().getHours();
    return {
      x: (sentiment?.score ?? 0) * 20 + (Math.random() * 2 - 1),
      y: (derived.wordCount / 50) * 10 + (Math.random() * 2 - 1),
      z: ((hour - 12) / 12) * 20 + (Math.random() * 2 - 1),
      visualMass: Math.max(1.0, derived.wordCount / 100),
    };
  }

  private prepareContentForStorage(content: string): PersistedEntryContent {
    let processedContent = content;
    try {
      if (content.trim().startsWith('{') || content.trim().startsWith('[')) {
        processedContent = LZString.compressToBase64(content);
      }
    } catch (e) {
      console.warn('Compression failed for entry payload, saving raw content:', e);
    }

    return {
      plainContent: processedContent,
    };
  }

  private encryptPreparedContent(prepared: PersistedEntryContent, userId: string) {
    return encryptData(prepared.plainContent, userId);
  }

  private async assertEntryOwner(userId: string, entryId: string) {
    const existing = await db
      .select({ id: journalEntries.id })
      .from(journalEntries)
      .where(and(eq(journalEntries.id, entryId), eq(journalEntries.userId, userId)))
      .limit(1);

    if (existing.length === 0) {
      throw new Error('Unauthorized or entry not found.');
    }
  }

  private normalizeMediaContentType(contentType: string) {
    const normalized =
      contentType.split(';')[0]?.trim().toLowerCase() || 'application/octet-stream';
    if (!MEDIA_CONTENT_TYPES.has(normalized)) {
      throw new Error(`Unsupported media content type: ${contentType}`);
    }
    return normalized;
  }

  private mediaExtension(contentType: string) {
    if (contentType === 'image/jpeg') return 'jpg';
    if (contentType === 'image/svg+xml') return 'svg';
    return contentType.split('/')[1] || 'bin';
  }

  private getStorageKeyFromPublicUrl(url: string | null | undefined) {
    if (!url) return null;
    const publicBase = process.env.R2_PUBLIC_URL || process.env.CLOUDFLARE_R2_PUBLIC_URL;
    if (publicBase && url.startsWith(publicBase.replace(/\/+$/, ''))) {
      return url.slice(publicBase.replace(/\/+$/, '').length).replace(/^\/+/, '') || null;
    }

    try {
      return new URL(url).pathname.replace(/^\/+/, '') || null;
    } catch {
      return null;
    }
  }

  private getR2BucketName() {
    return process.env.R2_BUCKET_NAME || process.env.CLOUDFLARE_R2_BUCKET_NAME || 'soouls-media';
  }

  private getR2PublicUrl(key: string) {
    const baseUrl = process.env.R2_PUBLIC_URL || process.env.CLOUDFLARE_R2_PUBLIC_URL;
    if (!baseUrl) {
      throw new Error('R2_PUBLIC_URL is required to serve uploaded media.');
    }
    return `${baseUrl.replace(/\/+$/, '')}/${key}`;
  }

  private buildMediaKey(userId: string, entryId: string, contentType: string) {
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    return `entries/${userId}/${entryId}/${unique}.${this.mediaExtension(contentType)}`;
  }

  private extractEntryAttachments(full: any): EntryMediaAttachment[] {
    if (!Array.isArray(full?.blocks)) return [];

    return full.blocks
      .filter((block: any) => {
        return (
          !!block &&
          ['image', 'voice', 'doodle'].includes(block.type) &&
          typeof block.dataUrl === 'string' &&
          block.dataUrl.startsWith('http')
        );
      })
      .map((block: any) => {
        const storageKey =
          typeof block.storageKey === 'string'
            ? block.storageKey
            : this.getStorageKeyFromPublicUrl(block.dataUrl);

        return {
          blockId: typeof block.id === 'string' ? block.id : null,
          type: block.type,
          url: block.dataUrl,
          storageKey,
          contentType: typeof block.contentType === 'string' ? block.contentType : null,
          byteSize: typeof block.byteSize === 'number' ? block.byteSize : null,
          sha256: typeof block.sha256 === 'string' ? block.sha256 : null,
          name: typeof block.name === 'string' ? block.name : null,
          duration: typeof block.duration === 'number' ? block.duration : null,
          uploadedAt: typeof block.uploadedAt === 'string' ? block.uploadedAt : null,
        } satisfies EntryMediaAttachment;
      });
  }

  private buildEntryMetadata(attachments: EntryMediaAttachment[]): EntryMetadata {
    return {
      media: {
        count: attachments.length,
        sha256: attachments.flatMap((attachment) => attachment.sha256 ?? []),
        storageKeys: attachments.flatMap((attachment) => attachment.storageKey ?? []),
        byteSizeTotal: attachments.reduce((sum, attachment) => sum + (attachment.byteSize ?? 0), 0),
      },
    };
  }

  async createEntry(
    userId: string,
    content: string,
    type: 'entry' | 'task' = 'entry',
    options: { analyze?: boolean } = {},
  ) {
    const derived = this.deriveEntryFields(content, type);
    const { sentiment, embedding } = options.analyze
      ? await this.analyzeEntryText(derived.extractedText)
      : { sentiment: null, embedding: null };

    const preparedContent = this.prepareContentForStorage(content);
    const encryptedContent = this.encryptPreparedContent(preparedContent, userId);

    let entry: { id: string };
    try {
      [entry] = await db
        .insert(journalEntries)
        .values({
          userId,
          content: encryptedContent,
          type,
          title: derived.title,
          wordCount: derived.wordCount,
          ...(derived.taskStatus ? { taskStatus: derived.taskStatus } : {}),
          ...(derived.mediaUrl ? { mediaUrl: derived.mediaUrl } : {}),
          attachments: derived.attachments,
          metadata: derived.metadata,
          ...(options.analyze
            ? {
                status: 'published' as const,
                sentimentScore: sentiment?.score ?? undefined,
                sentimentLabel: sentiment?.label ?? undefined,
                sentimentColor: sentiment?.color ?? undefined,
                embedding: embedding ?? undefined,
              }
            : {}),
        })
        .returning();
    } catch (error) {
      console.warn(
        'Entry metadata insert failed; retrying encrypted content-only save:',
        error instanceof Error ? error.message : error,
      );
      const result = await db.execute(sql`
        INSERT INTO "journal_entries" ("id", "user_id", "content", "type", "created_at", "updated_at")
        VALUES (gen_random_uuid(), ${userId}, ${encryptedContent}, ${type}, now(), now())
        RETURNING "id"
      `);
      entry = { id: (result[0] as any).id };
    }

    const position = this.buildCanvasPosition(derived, sentiment);

    try {
      await db.insert(canvasNodes).values({
        entryId: entry.id,
        x: position.x,
        y: position.y,
        z: position.z,
        visualMass: type === 'task' ? 1.8 : position.visualMass,
        emotion: sentiment?.label,
      });
    } catch (error) {
      console.warn(
        'Canvas node creation failed; entry content remains saved:',
        error instanceof Error ? error.message : error,
      );
    }

    await this.invalidateUserEntryCache(userId);
    return entry;
  }

  async getEntry(userId: string, id: string) {
    const cacheKey = this.getEntryCacheKey(userId, id);
    const cached = await this.redis.get<{ id: string; content: string }>(cacheKey);
    if (cached) return cached;

    const [entry] = await db
      .select({ id: journalEntries.id, content: journalEntries.content })
      .from(journalEntries)
      .where(and(eq(journalEntries.id, id), eq(journalEntries.userId, userId)))
      .limit(1);

    if (entry) {
      const { text, full } = this.processEntryContent(entry.content, userId);
      // For single entry view, we often want the full JSON for the editor
      entry.content = full ? JSON.stringify(full) : text;
      await this.redis.set(cacheKey, entry, this.CACHE_TTL.ENTRY);
    }
    return entry || null;
  }

  async updateEntry(
    userId: string,
    id: string,
    content: string,
    options: { analyze?: boolean } = {},
  ) {
    // 1. Validate ownership and existence in a single step
    const existing = await db
      .select({
        id: journalEntries.id,
        type: journalEntries.type,
        updatedAt: journalEntries.updatedAt,
      })
      .from(journalEntries)
      .where(and(eq(journalEntries.id, id), eq(journalEntries.userId, userId)))
      .limit(1);

    if (existing.length === 0) {
      throw new Error(`Entry ${id} not found or unauthorized for user ${userId}`);
    }

    // 2. Derive metadata (word count, status, etc)
    const derived = this.deriveEntryFields(content, existing[0].type);

    const { sentiment, embedding } = options.analyze
      ? await this.analyzeEntryText(derived.extractedText)
      : { sentiment: null, embedding: null };

    const preparedContent = this.prepareContentForStorage(content);
    const encryptedContent = this.encryptPreparedContent(preparedContent, userId);

    try {
      await db
        .update(journalEntries)
        .set({
          content: encryptedContent,
          title: derived.title,
          wordCount: derived.wordCount,
          ...(derived.taskStatus ? { taskStatus: derived.taskStatus } : {}),
          ...(derived.mediaUrl ? { mediaUrl: derived.mediaUrl } : {}),
          attachments: derived.attachments,
          metadata: derived.metadata,
          ...(options.analyze
            ? {
                status: 'published' as const,
                sentimentScore: sentiment?.score ?? undefined,
                sentimentLabel: sentiment?.label ?? undefined,
                sentimentColor: sentiment?.color ?? undefined,
                embedding: embedding ?? undefined,
              }
            : {}),
          updatedAt: new Date(), // Explicitly update timestamp
        })
        .where(and(eq(journalEntries.id, id), eq(journalEntries.userId, userId)));
    } catch (error) {
      console.warn(
        'Entry metadata update failed; retrying encrypted content-only save:',
        error instanceof Error ? error.message : error,
      );
      await db
        .update(journalEntries)
        .set({
          content: encryptedContent,
          updatedAt: new Date(),
        })
        .where(and(eq(journalEntries.id, id), eq(journalEntries.userId, userId)));
    }

    if (options.analyze) {
      const position = this.buildCanvasPosition(derived, sentiment);
      try {
        await db
          .update(canvasNodes)
          .set({
            x: position.x,
            y: position.y,
            z: position.z,
            visualMass: existing[0].type === 'task' ? 1.8 : position.visualMass,
            emotion: sentiment?.label,
            updatedAt: new Date(),
          })
          .where(eq(canvasNodes.entryId, id));
      } catch (error) {
        console.warn(
          'Canvas node update failed; entry content remains saved:',
          error instanceof Error ? error.message : error,
        );
      }
    }

    // 5. Invalidate Cache
    await Promise.all([
      this.redis.del(this.getEntryCacheKey(userId, id)),
      this.invalidateUserEntryCache(userId),
    ]);
  }

  async getUploadPresignedUrl(userId: string, entryId: string, contentType: string) {
    await this.assertEntryOwner(userId, entryId);
    const normalizedContentType = this.normalizeMediaContentType(contentType);
    const key = this.buildMediaKey(userId, entryId, normalizedContentType);

    const bucketParams = {
      Bucket: this.getR2BucketName(),
      Key: key,
      ContentType: normalizedContentType,
    };

    const command = new PutObjectCommand(bucketParams);
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

    return { uploadUrl: signedUrl, publicUrl: this.getR2PublicUrl(key), storageKey: key };
  }

  async uploadMediaDataUrl(
    userId: string,
    entryId: string,
    dataUrl: string,
    contentType: string,
  ): Promise<{
    publicUrl: string;
    storageKey: string;
    contentType: string;
    byteSize: number;
    sha256: string;
  }> {
    await this.assertEntryOwner(userId, entryId);
    const normalizedContentType = this.normalizeMediaContentType(contentType);
    const match = /^data:([^;,]+)(?:;[^,]*)?;base64,(.+)$/u.exec(dataUrl);
    if (!match) {
      throw new Error('Media payload must be a base64 data URL.');
    }

    const dataUrlContentType = this.normalizeMediaContentType(match[1]);
    const effectiveContentType =
      dataUrlContentType === normalizedContentType ? normalizedContentType : dataUrlContentType;
    const key = this.buildMediaKey(userId, entryId, effectiveContentType);
    const body = Buffer.from(match[2], 'base64');

    await s3.send(
      new PutObjectCommand({
        Bucket: this.getR2BucketName(),
        Key: key,
        Body: body,
        ContentType: effectiveContentType,
      }),
    );

    return {
      publicUrl: this.getR2PublicUrl(key),
      storageKey: key,
      contentType: effectiveContentType,
      byteSize: body.byteLength,
      sha256: createHash('sha256').update(body).digest('hex'),
    };
  }

  async updateEntryMediaUrl(userId: string, entryId: string, mediaUrl: string) {
    const existing = await db
      .select({ id: journalEntries.id })
      .from(journalEntries)
      .where(and(eq(journalEntries.id, entryId), eq(journalEntries.userId, userId)))
      .limit(1);

    if (existing.length === 0) {
      throw new Error('Unauthorized or entry not found.');
    }

    await db
      .update(journalEntries)
      .set({ mediaUrl })
      .where(and(eq(journalEntries.id, entryId), eq(journalEntries.userId, userId)));

    await this.redis.del(this.getEntryCacheKey(userId, entryId));
    await this.invalidateUserEntryCache(userId);
  }

  async deleteEntry(userId: string, id: string) {
    const existing = await db
      .select({ id: journalEntries.id })
      .from(journalEntries)
      .where(and(eq(journalEntries.id, id), eq(journalEntries.userId, userId)))
      .limit(1);

    if (existing.length === 0) {
      throw new Error(`Entry ${id} not found or unauthorized for user ${userId}`);
    }

    await db.delete(canvasNodes).where(eq(canvasNodes.entryId, id));
    await db
      .delete(journalEntries)
      .where(and(eq(journalEntries.id, id), eq(journalEntries.userId, userId)));

    await Promise.all([
      this.redis.del(this.getEntryCacheKey(userId, id)),
      this.invalidateUserEntryCache(userId),
    ]);
  }

  async findSimilarEntries(
    embedding: number[],
    userId: string,
    limit = 5,
  ): Promise<Array<{ id: string }>> {
    const embeddingString = JSON.stringify(embedding);
    const rows = await db.execute(sql`
      SELECT * FROM ${journalEntries}
      WHERE ${journalEntries.userId} = ${userId}
      ORDER BY ${journalEntries.embedding} <=> ${embeddingString}::vector
      LIMIT ${limit}
    `);
    return rows as unknown as Array<{ id: string }>;
  }

  async getGalaxyData(userId: string, limit = 100, cursor = 0) {
    const version = await this.getUserVersion(userId);
    const cacheKey = this.getCacheKey('galaxy', userId, version, limit, cursor);
    const cached = await this.redis.get<{ items: GalaxyEntry[]; nextCursor: number | null }>(
      cacheKey,
    );
    if (cached) return cached;

    const rawData = await db
      .select({
        id: journalEntries.id,
        content: journalEntries.content,
        createdAt: journalEntries.createdAt,
        type: journalEntries.type,
        sentimentColor: journalEntries.sentimentColor,
        sentimentLabel: journalEntries.sentimentLabel,
        x: canvasNodes.x,
        y: canvasNodes.y,
        z: canvasNodes.z,
        visualMass: canvasNodes.visualMass,
      })
      .from(journalEntries)
      .leftJoin(canvasNodes, eq(journalEntries.id, canvasNodes.entryId))
      .where(eq(journalEntries.userId, userId))
      .orderBy(desc(journalEntries.createdAt))
      .limit(limit + 1)
      .offset(cursor);

    let nextCursor: number | null = null;
    let itemsToReturn = rawData;

    if (rawData.length > limit) {
      itemsToReturn = rawData.slice(0, limit);
      nextCursor = cursor + limit;
    }

    // Decrypt on the way out
    const items = itemsToReturn.map((entry) => {
      const { text, full } = this.processEntryContent(entry.content, userId);

      let optimizedContent = text;
      if (full) {
        // For galaxy, we strip heavy blocks but keep the text
        const optimized = { ...full, blocks: [] };
        optimizedContent = LZString.compressToUTF16(JSON.stringify(optimized));
      }

      return {
        ...entry,
        content: optimizedContent,
        previewText: text,
        createdAt:
          entry.createdAt instanceof Date ? entry.createdAt.toISOString() : entry.createdAt,
        // Ensure numbers are never null for the 3D galaxy
        x: entry.x ?? 0,
        y: entry.y ?? 0,
        z: entry.z ?? 0,
      } as GalaxyEntry;
    });

    const result = { items, nextCursor };
    await this.redis.set(cacheKey, result, this.CACHE_TTL.GALAXY);
    return result;
  }

  /**
   * Get all entries for a user with FULL content (not stripped).
   * Used by the dashboard timeline to show descriptions and media.
   */
  async getAllEntries(userId: string, limit = 50, cursor = 0, search?: string) {
    const version = await this.getUserVersion(userId);
    const normalizedSearch = search?.trim().toLowerCase() ?? '';
    const cacheKey = this.getCacheKey(
      'entries:all',
      userId,
      version,
      limit,
      cursor,
      normalizedSearch,
    );

    // Skip cache if searching
    if (!search) {
      const cached = await this.redis.get<{ items: UserEntry[]; nextCursor: number | null }>(
        cacheKey,
      );
      if (cached) return cached;
    }

    const rawData = await db
      .select({
        id: journalEntries.id,
        content: journalEntries.content,
        type: journalEntries.type,
        title: journalEntries.title,
        mediaUrl: journalEntries.mediaUrl,
        sentimentColor: journalEntries.sentimentColor,
        sentimentLabel: journalEntries.sentimentLabel,
        clusterId: journalEntries.clusterId,
        taskStatus: journalEntries.taskStatus,
        createdAt: journalEntries.createdAt,
        updatedAt: journalEntries.updatedAt,
      })
      .from(journalEntries)
      .where(eq(journalEntries.userId, userId))
      .orderBy(desc(journalEntries.createdAt))
      .limit(normalizedSearch ? 200 : limit + 1)
      .offset(normalizedSearch ? 0 : cursor);

    // Decrypt full content on the way out
    const decodedItems = rawData.map((entry) => {
      const { text, full } = this.processEntryContent(entry.content, userId);
      return {
        ...entry,
        content: full ? JSON.stringify(full) : text,
        searchText: [entry.title ?? '', text, entry.sentimentLabel ?? ''].join(' ').toLowerCase(),
      };
    });

    const filteredItems = normalizedSearch
      ? decodedItems.filter((entry) => entry.searchText.includes(normalizedSearch))
      : decodedItems;

    let nextCursor: number | null = null;
    let itemsToReturn = filteredItems;

    if (filteredItems.length > limit) {
      itemsToReturn = filteredItems.slice(0, limit);
      nextCursor = cursor + limit;
    }

    const items = itemsToReturn.map(({ searchText: _searchText, ...entry }) => entry);

    const result = { items, nextCursor };
    if (!normalizedSearch) {
      await this.redis.set(cacheKey, result, this.CACHE_TTL.ENTRIES_ALL);
    }
    return result;
  }

  /**
   * List all entries across all users (admin view).
   * Returns decrypted descriptions with user info.
   */
  async listAllEntriesAdmin(limit = 50, offset = 0) {
    const cacheKey = this.getCacheKey('admin:entries', limit, offset);
    const cached = await this.redis.get<{ items: unknown[]; total: number }>(cacheKey);
    if (cached) return cached;

    const rawData = await db
      .select({
        id: journalEntries.id,
        userId: journalEntries.userId,
        content: journalEntries.content,
        type: journalEntries.type,
        title: journalEntries.title,
        mediaUrl: journalEntries.mediaUrl,
        sentimentColor: journalEntries.sentimentColor,
        sentimentLabel: journalEntries.sentimentLabel,
        clusterId: journalEntries.clusterId,
        taskStatus: journalEntries.taskStatus,
        createdAt: journalEntries.createdAt,
        updatedAt: journalEntries.updatedAt,
        userEmail: users.email,
        userName: users.name,
      })
      .from(journalEntries)
      .innerJoin(users, eq(journalEntries.userId, users.id))
      .orderBy(desc(journalEntries.createdAt))
      .limit(limit)
      .offset(offset);

    // Decrypt content for admin view
    const items = rawData.map((entry) => {
      const { text } = this.processEntryContent(entry.content, entry.userId);
      return {
        id: entry.id,
        userId: entry.userId,
        userEmail: entry.userEmail,
        userName: entry.userName,
        type: entry.type,
        title: entry.title,
        content: text,
        mediaUrl: entry.mediaUrl,
        sentimentColor: entry.sentimentColor,
        sentimentLabel: entry.sentimentLabel,
        clusterId: entry.clusterId,
        taskStatus: entry.taskStatus,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
      };
    });

    // Get total count
    const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(journalEntries);
    const total = Number(countResult?.count ?? 0);

    const result = { items, total };
    await this.redis.set(cacheKey, result, 300); // 5 minutes cache for admin list
    return result;
  }

  async migrateMedia(userId: string) {
    const entries = await db.select().from(journalEntries).where(eq(journalEntries.userId, userId));

    let migratedCount = 0;

    for (const entry of entries) {
      let contentData: any;
      try {
        const decrypted = decryptData(entry.content, userId);
        const decompressed = LZString.decompressFromUTF16(decrypted) || decrypted;
        contentData = JSON.parse(decompressed);
      } catch (_e) {
        // Not a JSON block entry or decryption failed — skip this entry
        continue;
      }

      if (!contentData || typeof contentData !== 'object') continue;

      const blocks = contentData.blocks || [];
      let entryChanged = false;

      for (const block of blocks) {
        if (block.type === 'image' && block.dataUrl?.startsWith('data:image')) {
          try {
            // Convert dataUrl to buffer
            const parts = block.dataUrl.split(',');
            const base64Data = parts[1];
            if (!base64Data) continue;

            const buffer = Buffer.from(base64Data, 'base64');
            const mimeType = parts[0]?.split(':')[1]?.split(';')[0] || 'image/png';
            const extension = mimeType.split('/')[1] || 'png';
            const fileName = `entries/${userId}/${entry.id}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${extension}`;

            const bucketParams = {
              Bucket: process.env.R2_BUCKET_NAME || 'soouls-media',
              Key: fileName,
              Body: buffer,
              ContentType: mimeType,
            };

            await s3.send(new PutObjectCommand(bucketParams));

            const publicUrlBase = process.env.R2_PUBLIC_URL;
            if (publicUrlBase) {
              block.dataUrl = `${publicUrlBase}/${fileName}`;
              entryChanged = true;
            }
          } catch (error) {
            console.error(`Failed to migrate media block in entry ${entry.id}`, error);
          }
        }
      }

      if (entryChanged) {
        try {
          const updatedContent = JSON.stringify(contentData);
          const compressed = LZString.compressToUTF16(updatedContent);
          const encrypted = encryptData(compressed, userId);

          await db
            .update(journalEntries)
            .set({ content: encrypted, updatedAt: new Date() })
            .where(eq(journalEntries.id, entry.id));

          // Invalidate specific entry cache
          await this.redis.del(this.getEntryCacheKey(userId, entry.id));
          migratedCount++;
        } catch (e) {
          console.error(`Failed to save migrated entry ${entry.id}:`, e);
        }
      }
    }

    // Invalidate user cache if anything changed
    if (migratedCount > 0) {
      await this.invalidateUserEntryCache(userId);
    }

    return { migratedCount };
  }

  async upsertSync(
    userId: string,
    input: { id?: string; content: string; type?: EntryKind; finalize?: boolean },
  ) {
    if (input.id && !input.id.startsWith('temp-')) {
      // Existing entry, update it
      await this.updateEntry(userId, input.id, input.content, { analyze: input.finalize === true });
      return { id: input.id };
    }

    // New entry, create it
    const entry = await this.createEntry(userId, input.content, input.type || 'entry', {
      analyze: input.finalize === true,
    });
    return { id: entry.id };
  }
}
