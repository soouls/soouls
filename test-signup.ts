import 'dotenv/config';
import { db } from '@soouls/database/client';
import { users } from '@soouls/database/schema';

async function run() {
  const allUsers = await db.select().from(users).limit(5);
  console.log('Users:', allUsers);
  process.exit(0);
}
run();
