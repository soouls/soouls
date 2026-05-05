import { db } from './src/client';
import { sql } from 'drizzle-orm';

async function main() {
  try {
    const result = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'journal_entries'
    `);
    console.log('Columns in DB:', result.map(r => r.column_name));
  } catch (err) {
    console.error('Error:', err);
  }
}

main();
