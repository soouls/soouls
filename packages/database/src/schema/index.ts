import { integer, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
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
  moodScore: integer('mood_score'),
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
  x: integer('x').notNull(),
  y: integer('y').notNull(),
  z: integer('z').notNull(),
  emotion: text('emotion'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
