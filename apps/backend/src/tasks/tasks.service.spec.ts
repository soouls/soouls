import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

const selectMock = mock(() => undefined);
const updateMock = mock(() => undefined);
const deleteMock = mock(() => undefined);

mock.module('@soouls/database/schema', () => ({
  payments: {},
  subscriptions: {},
  razorpayWebhooks: {},
  users: {
    id: 'users.id',
    email: 'users.email',
    name: 'users.name',
    planType: 'users.plan_type',
    createdAt: 'users.created_at',
    trialEndsAt: 'users.trial_ends_at',
  },
  canvasNodes: {
    entryId: 'canvas_nodes.entry_id',
    visualMass: 'canvas_nodes.visual_mass',
  },
  journalEntries: {
    id: 'journal_entries.id',
    type: 'journal_entries.type',
    deadline: 'journal_entries.deadline',
    userId: 'journal_entries.user_id',
  },
}));

mock.module('@soouls/database/client', () => ({
  db: {
    select: selectMock,
    update: updateMock,
    delete: deleteMock,
  },
  and: (...args: unknown[]) => args,
  eq: (...args: unknown[]) => args,
  or: (...args: unknown[]) => args,
  sql: (strings: TemplateStringsArray, ...values: unknown[]) => ({ strings, values }),
}));

// Mock RedisService to prevent actual connection attempts
mock.module('../redis/redis.service', () => ({
  RedisService: class RedisService {
    del = mock(async () => undefined);
    invalidatePattern = mock(async () => undefined);
  },
}));

// Mock Resend
const sendEmailMock = mock(async () => ({ data: { id: 'email-id' } }));
mock.module('resend', () => ({
  Resend: class Resend {
    emails = {
      send: sendEmailMock,
    };
  },
}));

// Mock Clerk Backend to prevent actual fetch/network requests
mock.module('@clerk/backend', () => ({
  createClerkClient: mock(() => ({
    users: {
      deleteUser: mock(async () => undefined),
    },
  })),
}));

let TasksService: typeof import('./tasks.service.js').TasksService;

function createSelectBuilder<T>(result: T) {
  const builder = {
    from: mock(() => builder),
    where: mock(() => Promise.resolve(result)),
  };
  return builder;
}

describe('TasksService - Trial Expiry Emails', () => {
  let redisMockInstance: any;

  beforeAll(async () => {
    ({ TasksService } = await import('./tasks.service.js'));
  });

  beforeEach(() => {
    selectMock.mockReset();
    updateMock.mockReset();
    deleteMock.mockReset();
    sendEmailMock.mockReset();

    redisMockInstance = {
      del: mock(async () => undefined),
      invalidatePattern: mock(async () => undefined),
    };

    process.env.RESEND_API_KEY = 're_test_123';
  });

  it('sends trial expiry email to users matching criteria', async () => {
    // Mock database response for select
    const testUsers = [
      { id: 'user-1', email: 'user1@example.com', name: 'User One' },
      { id: 'user-3', email: 'user3@example.com', name: 'User Three' },
    ];
    selectMock.mockImplementation(() => createSelectBuilder(testUsers));

    const service = new TasksService(redisMockInstance);
    await service.sendTrialExpiryEmails();

    // Verify email was sent to user-1 and user-3
    expect(sendEmailMock).toHaveBeenCalledTimes(2);
    expect(sendEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user1@example.com',
        subject: 'Your 14-Day Free Trial has expired!',
      }),
    );
    expect(sendEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user3@example.com',
        subject: 'Your 14-Day Free Trial has expired!',
      }),
    );
  });

  it('does not send email if no users are expiring', async () => {
    selectMock.mockImplementation(() => createSelectBuilder([]));

    const service = new TasksService(redisMockInstance);
    await service.sendTrialExpiryEmails();

    expect(sendEmailMock).not.toHaveBeenCalled();
  });
});
