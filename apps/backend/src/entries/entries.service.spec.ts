import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';
import LZString from 'lz-string';

const selectMock = mock(() => undefined);
const insertMock = mock(() => undefined);
const updateMock = mock(() => undefined);
const deleteMock = mock(() => undefined);
const executeMock = mock(() => undefined);
const s3SendMock = mock(async () => undefined);

mock.module('@aws-sdk/client-s3', () => ({
  PutObjectCommand: class PutObjectCommand {
    input: unknown;

    constructor(input: unknown) {
      this.input = input;
    }
  },
  S3Client: class S3Client {
    send = s3SendMock;
  },
}));

mock.module('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: mock(async () => 'https://example.com/upload'),
}));

mock.module('@soouls/ai-engine/embeddings', () => ({
  generateEmbedding: mock(async () => new Array(1536).fill(0)),
}));

mock.module('@soouls/ai-engine/sentiment', () => ({
  analyzeSentiment: mock(async () => ({
    score: 0,
    label: 'Neutral',
    color: '#888888',
  })),
}));

mock.module('../redis/redis.service', () => ({
  RedisService: class RedisService {},
}));

mock.module('@soouls/database/schema', () => ({
  adminInvites: { id: 'admin_invites.id' },
  adminUsers: { userId: 'admin_users.user_id' },
  canvasNodes: {
    entryId: 'canvas_nodes.entry_id',
    x: 'canvas_nodes.x',
    y: 'canvas_nodes.y',
    z: 'canvas_nodes.z',
    visualMass: 'canvas_nodes.visual_mass',
  },
  journalEntries: {
    id: 'journal_entries.id',
    content: 'journal_entries.content',
    createdAt: 'journal_entries.created_at',
    mediaUrl: 'journal_entries.media_url',
    embedding: 'journal_entries.embedding',
    sentimentColor: 'journal_entries.sentiment_color',
    sentimentLabel: 'journal_entries.sentiment_label',
    taskStatus: 'journal_entries.task_status',
    title: 'journal_entries.title',
    type: 'journal_entries.type',
    updatedAt: 'journal_entries.updated_at',
    userId: 'journal_entries.user_id',
    wordCount: 'journal_entries.word_count',
    status: 'journal_entries.status',
    sentimentScore: 'journal_entries.sentiment_score',
  },
  messageCampaigns: {
    id: 'message_campaigns.id',
  },
  messageDeliveries: {
    id: 'message_deliveries.id',
  },
  waitlistUsers: {
    id: 'waitlist_users.id',
    email: 'waitlist_users.email',
    phoneNumber: 'waitlist_users.phone_number',
    createdAt: 'waitlist_users.created_at',
  },
  users: {
    billingTier: 'users.billing_tier',
    clerkId: 'users.clerk_id',
    createdAt: 'users.created_at',
    email: 'users.email',
    id: 'users.id',
    isWaitlistUser: 'users.is_waitlist_user',
    lastSecureAccessSentAt: 'users.last_secure_access_sent_at',
    marketingEmailOptIn: 'users.marketing_email_opt_in',
    marketingWhatsappOptIn: 'users.marketing_whatsapp_opt_in',
    name: 'users.name',
    phoneNumber: 'users.phone_number',
    transactionalEmailOptIn: 'users.transactional_email_opt_in',
    transactionalWhatsappOptIn: 'users.transactional_whatsapp_opt_in',
    updatedAt: 'users.updated_at',
    welcomeEmailSentAt: 'users.welcome_email_sent_at',
    welcomeWhatsappSentAt: 'users.welcome_whatsapp_sent_at',
  },
}));

mock.module('@soouls/database/client', () => ({
  db: {
    select: selectMock,
    insert: insertMock,
    update: updateMock,
    delete: deleteMock,
    execute: executeMock,
  },
  and: (...args: unknown[]) => args,
  desc: (value: unknown) => value,
  eq: (...args: unknown[]) => args,
  or: (...args: unknown[]) => args,
  sql: (strings: TemplateStringsArray, ...values: unknown[]) => ({ strings, values }),
}));

let EntriesService: typeof import('./entries.service.js').EntriesService;

function createSelectBuilder<T>(result: T) {
  const builder = {
    from: mock(() => builder),
    where: mock(() => builder),
    orderBy: mock(() => builder),
    offset: mock(() => builder),
    limit: mock(() => Promise.resolve(result)),
  };

  return builder;
}

describe('EntriesService', () => {
  const redis = {
    del: mock(async () => undefined),
    get: mock(async (_key: string) => null),
    invalidatePattern: mock(async (_pattern: string) => undefined),
    set: mock(async (_key: string, _value: unknown, _ttl: number) => undefined),
  };

  beforeAll(async () => {
    ({ EntriesService } = await import('./entries.service.js'));
  });

  beforeEach(() => {
    selectMock.mockReset();
    insertMock.mockReset();
    updateMock.mockReset();
    deleteMock.mockReset();
    executeMock.mockReset();
    s3SendMock.mockReset();
    redis.del.mockReset();
    redis.get.mockReset();
    redis.invalidatePattern.mockReset();
    redis.set.mockReset();

    process.env.R2_PUBLIC_URL = 'https://media.example.com';
    redis.get.mockImplementation(async (_key: string) => null);
    redis.del.mockImplementation(async () => undefined);
    redis.invalidatePattern.mockImplementation(async () => undefined);
    redis.set.mockImplementation(async () => undefined);
    s3SendMock.mockImplementation(async () => undefined);
    selectMock.mockImplementation(() => createSelectBuilder([]));
  });

  it('derives title and task completion from compressed autosave payloads', () => {
    const service = new EntriesService(redis as any);
    const payload = JSON.stringify({
      textContent: 'Finish roadmap before sleep',
      blocks: [
        {
          type: 'tasklist',
          tasks: [
            { text: 'Write outline', done: true },
            { text: 'Ship draft', done: true },
          ],
        },
      ],
    });

    const derived = (service as any).deriveEntryFields(LZString.compressToUTF16(payload), 'task');

    expect(derived).toEqual({
      title: 'Finish roadmap before sleep',
      wordCount: 12,
      taskStatus: 'completed',
      mediaUrl: null,
      attachments: [],
      metadata: {
        media: {
          byteSizeTotal: 0,
          count: 0,
          sha256: [],
          storageKeys: [],
        },
      },
      extractedText: 'Finish roadmap before sleep\n\n- [x] Write outline\n\n- [x] Ship draft',
    });
  });

  it('mirrors uploaded media metadata into derived entry fields', () => {
    const service = new EntriesService(redis as any);
    const payload = JSON.stringify({
      textContent: 'Photo and voice memory',
      blocks: [
        {
          id: 'image-block',
          type: 'image',
          dataUrl: 'https://media.example.com/entries/user-123/entry-123/photo.webp',
          storageKey: 'entries/user-123/entry-123/photo.webp',
          contentType: 'image/webp',
          byteSize: 1280,
          sha256: 'abc123',
          name: 'photo.webp',
          uploadedAt: '2026-05-03T00:00:00.000Z',
        },
        {
          id: 'voice-block',
          type: 'voice',
          dataUrl: 'https://media.example.com/entries/user-123/entry-123/voice.webm',
          storageKey: 'entries/user-123/entry-123/voice.webm',
          contentType: 'audio/webm',
          byteSize: 2560,
          sha256: 'def456',
          duration: 7,
          uploadedAt: '2026-05-03T00:00:01.000Z',
        },
      ],
    });

    const derived = (service as any).deriveEntryFields(payload, 'entry');

    expect(derived.mediaUrl).toBe(
      'https://media.example.com/entries/user-123/entry-123/photo.webp',
    );
    expect(derived.attachments).toEqual([
      {
        blockId: 'image-block',
        type: 'image',
        url: 'https://media.example.com/entries/user-123/entry-123/photo.webp',
        storageKey: 'entries/user-123/entry-123/photo.webp',
        contentType: 'image/webp',
        byteSize: 1280,
        sha256: 'abc123',
        name: 'photo.webp',
        duration: null,
        uploadedAt: '2026-05-03T00:00:00.000Z',
      },
      {
        blockId: 'voice-block',
        type: 'voice',
        url: 'https://media.example.com/entries/user-123/entry-123/voice.webm',
        storageKey: 'entries/user-123/entry-123/voice.webm',
        contentType: 'audio/webm',
        byteSize: 2560,
        sha256: 'def456',
        name: null,
        duration: 7,
        uploadedAt: '2026-05-03T00:00:01.000Z',
      },
    ]);
    expect(derived.metadata).toEqual({
      media: {
        count: 2,
        sha256: ['abc123', 'def456'],
        storageKeys: [
          'entries/user-123/entry-123/photo.webp',
          'entries/user-123/entry-123/voice.webm',
        ],
        byteSizeTotal: 3840,
      },
    });
  });

  it('scopes cached single-entry reads to the requesting user', async () => {
    const service = new EntriesService(redis as any);

    redis.get.mockImplementation(async (key: string) =>
      key === 'entry:entry-123' ? { id: 'entry-123', content: 'leaked content' } : null,
    );
    selectMock.mockImplementation(() => createSelectBuilder([]));

    const result = await service.getEntry('user-b', 'entry-123');

    expect(redis.get).toHaveBeenCalledWith('entry:user-b:entry-123');
    expect(result).toBeNull();
  });

  it('uploads media data URLs through the backend and returns a public R2 URL', async () => {
    const service = new EntriesService(redis as any);
    selectMock.mockImplementation(() => createSelectBuilder([{ id: 'entry-123' }]));

    const result = await service.uploadMediaDataUrl(
      'user-123',
      'entry-123',
      'data:image/png;base64,aGVsbG8=',
      'image/png',
    );

    expect(result.publicUrl).toStartWith('https://media.example.com/entries/user-123/entry-123/');
    expect(result.publicUrl).toEndWith('.png');
    expect(s3SendMock).toHaveBeenCalledTimes(1);
  });
});
