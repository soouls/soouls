import { db } from '@soouls/database/client';
import { users } from '@soouls/database/schema';
import { NotificationDispatchService } from '../src/notifications/notification-dispatch.service';

async function main() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is required to sync contacts.');
  }

  const dispatcher = new NotificationDispatchService();
  const rows = await db.select({ id: users.id, email: users.email }).from(users);

  let synced = 0;
  let failed = 0;

  for (const user of rows) {
    try {
      await dispatcher.syncResendContactByUserId(user.id);
      synced += 1;
      console.log(`[Resend sync] synced ${user.email}`);
    } catch (error) {
      failed += 1;
      console.error(`[Resend sync] failed ${user.email}`, error);
    }
  }

  console.log(`[Resend sync] complete: ${synced} synced, ${failed} failed`);

  if (failed > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error('[Resend sync] fatal', error);
  process.exitCode = 1;
});
