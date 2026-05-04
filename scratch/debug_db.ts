import { db, eq } from '../packages/database/src/client';
import { journalEntries, users } from '../packages/database/src/schema';

async function debug() {
  const allUsers = await db.select().from(users).limit(5);
  console.log('Users:', allUsers.map((u: any) => ({ id: u.id, name: u.name })));

  if (allUsers.length > 0) {
    const userId = allUsers[0].id;
    const entries = await db.select().from(journalEntries).where(eq(journalEntries.userId, userId)).limit(10);
    console.log(`Entries for ${userId}:`, entries.map((e: any) => ({ id: e.id, title: e.title, text: e.content.substring(0, 50) })));
  }
}

debug().catch(console.error);
