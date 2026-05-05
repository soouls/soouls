import { db } from './packages/database/src/client';
import { journalEntries } from './packages/database/src/schema/index.ts';

async function main() {
  const userId = '0f5780fa-fa5c-4923-b005-e28d1eb35ce0'; // From screenshot
  try {
    const [entry] = await db
      .insert(journalEntries)
      .values({
        userId,
        content: 'test-content',
        type: 'entry',
      })
      .returning({ id: journalEntries.id });
    console.log('Success:', entry.id);
  } catch (err) {
    console.error('Error:', err);
  }
}

main();
