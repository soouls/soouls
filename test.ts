import { db } from './packages/database/src/index.ts';
import { users } from './packages/database/src/schema/index.ts';
import { HomeService } from './apps/backend/src/home/home.service.ts';
import { EntriesService } from './apps/backend/src/entries/entries.service.ts';
import { RedisService } from './apps/backend/src/redis/redis.service.ts';

async function main() {
  const user = await db.query.users.findFirst();
  if(!user) throw new Error('No user');
  console.log('Found user:', user.id);
  const redis = new RedisService();
  const entriesService = new EntriesService();
  const homeService = new HomeService(entriesService, redis);
  const account = await homeService.getAccount(user.id);
  console.log(JSON.stringify(account, null, 2));
  process.exit(0);
}
main().catch(console.error);
