import { sql } from 'drizzle-orm';
import { db } from './src/client';

async function main() {
  try {
    console.log('Checking for folders table...');
    const tableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'folders'
      )
    `);

    if (!tableExists[0].exists) {
      console.log('Creating folders table...');
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS "folders" (
          "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
          "name" text NOT NULL,
          "description" text,
          "color" text DEFAULT '#3B82F6',
          "icon" text DEFAULT 'folder',
          "parent_id" uuid,
          "created_at" timestamp DEFAULT now() NOT NULL,
          "updated_at" timestamp DEFAULT now() NOT NULL
        )
      `);
    }

    console.log('Adding folder_id column to journal_entries...');
    await db.execute(sql`
      ALTER TABLE "journal_entries" 
      ADD COLUMN IF NOT EXISTS "folder_id" uuid REFERENCES "folders"("id") ON DELETE SET NULL
    `);

    console.log('Database sync complete.');
  } catch (err) {
    console.error('Database sync failed:', err);
    process.exit(1);
  }
}

main();
