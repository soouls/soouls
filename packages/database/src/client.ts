import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index.js';

const connectionString = process.env.DATABASE_URL || '';

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

const client = postgres(connectionString);
export const db = drizzle(client, { schema });

// Re-export specific drizzle-orm utilities to ensure single instance usage
export {
  eq,
  desc,
  sql,
  and,
  or,
  gt,
  lt,
  gte,
  lte,
  isNull,
  isNotNull,
  inArray,
  notInArray,
} from 'drizzle-orm';
