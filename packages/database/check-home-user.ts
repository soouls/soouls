import { sql } from 'drizzle-orm';
import { db } from './src/client';

const userId = process.argv[2];

if (!userId) {
  console.error('Usage: bun packages/database/check-home-user.ts <user-id>');
  process.exit(1);
}

const [user] = await db.execute(sql`
  SELECT id, email, name
  FROM users
  WHERE id = ${userId}
`);

const [entries] = await db.execute(sql`
  SELECT count(*)::int AS count
  FROM journal_entries
  WHERE user_id = ${userId}
`);

const [clusters] = await db.execute(sql`
  SELECT count(*)::int AS count
  FROM clusters
  WHERE user_id = ${userId}
`);

console.log({
  user,
  entries: entries?.count ?? 0,
  clusters: clusters?.count ?? 0,
});
