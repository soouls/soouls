import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';
import LZString from 'lz-string';

const selectMock = mock(() => undefined);
const insertMock = mock(() => undefined);
const updateMock = mock(() => undefined);
const executeMock = mock(() => undefined);

mock.module('@aws-sdk/client-s3', () => ({
  PutObjectCommand: class PutObjectCommand {},
  S3Client: class S3Client {
    send = mock(async () => undefined);
  },
}));

mock.module('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: mock(async () => 'https://example.com/upload'),
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
  },
  messageCampaigns: {
    id: 'message_campaigns.id',
  },
  messageDeliveries: {
    id: 'message_deliveries.id',
  },
  users: {
    clerkId: 'users.clerk_id',
    createdAt: 'users.created_at',
    email: 'users.email',
    id: 'users.id',
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
    execute: executeMock,
  },
  and: (...args: unknown[]) => args,
  desc: (value: unknown) => value,
  eq: (...args: unknown[]) => args,
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
    executeMock.mockReset();
    redis.del.mockReset();
    redis.get.mockReset();
    redis.invalidatePattern.mockReset();
    redis.set.mockReset();

    redis.get.mockImplementation(async (_key: string) => null);
    redis.del.mockImplementation(async () => undefined);
    redis.invalidatePattern.mockImplementation(async () => undefined);
    redis.set.mockImplementation(async () => undefined);
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
      wordCount: 4,
      taskStatus: 'completed',
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
});
