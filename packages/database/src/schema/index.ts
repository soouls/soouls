import {
  customType,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

// Vector type for pgvector
const vector = customType<{ data: number[] }>({
  dataType() {
    return 'vector(1536)'; // OpenAI text-embedding-3-small size
  },
});

export const entryTypeEnum = pgEnum('entry_type', ['entry', 'task']);

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkId: text('clerk_id').notNull().unique(), // Link to Clerk
  email: text('email').notNull().unique(),
  name: text('name'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Journal entries table
export const journalEntries = pgTable('journal_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  content: text('content').notNull(), // Encrypted content
  type: entryTypeEnum('type').default('entry').notNull(),

  // Semantic/AI fields
  embedding: vector('embedding'),
  sentimentScore: real('sentiment_score'),
  sentimentLabel: text('sentiment_label'), // Joy, Anxiety, Peace, etc.
  sentimentColor: text('sentiment_color'), // Hex code

  // Task specific fields
  deadline: timestamp('deadline'),
  status: text('status').default('pending'), // pending, completed

  metadata: jsonb('metadata'), // Additional data like tags, location, etc.
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Canvas nodes table (for 3D visualization)
export const canvasNodes = pgTable('canvas_nodes', {
  id: uuid('id').primaryKey().defaultRandom(),
  entryId: uuid('entry_id')
    .references(() => journalEntries.id)
    .notNull(),
  x: real('x').notNull(), // Changed to real for smoother positioning
  y: real('y').notNull(),
  z: real('z').notNull(),
  visualMass: real('visual_mass').default(1.0).notNull(), // For gravitational pull
  emotion: text('emotion'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
