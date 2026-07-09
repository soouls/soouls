import { createClerkClient } from '@clerk/backend';
import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { and, db, eq, sql } from '@soouls/database/client';
import { canvasNodes, journalEntries, users } from '@soouls/database/schema';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class TasksService {
  constructor(@Inject(RedisService) private readonly redis: RedisService) {}

  private getCacheKey(prefix: string, ...parts: (string | number)[]): string {
    return `${prefix}:${parts.join(':')}`;
  }

  private async invalidateUserCache(userId: string): Promise<void> {
    const patterns = [
      this.getCacheKey('entries:all', userId, '*'),
      this.getCacheKey('galaxy', userId, '*'),
    ];
    for (const pattern of patterns) {
      await this.redis.invalidatePattern(pattern);
    }
  }
  @Cron(CronExpression.EVERY_HOUR)
  async updateVisualMass() {
    try {
      console.log('Updating visual mass for tasks...');

      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const nextHour = new Date(now.getTime() + 60 * 60 * 1000);

      // Update tasks due within 24h
      await db
        .update(canvasNodes)
        .set({ visualMass: 4.0 })
        .where(sql`entry_id IN (
          SELECT id FROM journal_entries 
          WHERE type = 'task' 
          AND deadline <= ${tomorrow.toISOString()} 
          AND deadline > ${nextHour.toISOString()}
        )`);

      // Update tasks due within 1h
      await db
        .update(canvasNodes)
        .set({ visualMass: 5.0 })
        .where(sql`entry_id IN (
          SELECT id FROM journal_entries 
          WHERE type = 'task' 
          AND deadline <= ${nextHour.toISOString()}
        )`);
    } catch (error) {
      console.error('[Scheduler] Failed to update visual mass:', error);
    }
  }

  async convertToTask(userId: string, entryId: string, deadline: Date) {
    const result = await db
      .update(journalEntries)
      .set({ type: 'task', deadline })
      .where(and(eq(journalEntries.id, entryId), eq(journalEntries.userId, userId)))
      .returning({ id: journalEntries.id });

    if (result.length === 0) {
      throw new Error('Unauthorized or entry not found.');
    }

    await db.update(canvasNodes).set({ visualMass: 2.0 }).where(eq(canvasNodes.entryId, entryId));

    await this.redis.del(this.getCacheKey('entry', entryId));
    await this.invalidateUserCache(userId);
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async purgeSoftDeletedUsers() {
    try {
      console.log('[Scheduler] Running daily 30-day GDPR soft delete purge...');

      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const expiredUsers = await db
        .select({ id: users.id, clerkId: users.clerkId })
        .from(users)
        .where(
          and(sql`${users.deletedAt} IS NOT NULL`, sql`${users.deletedAt} <= ${thirtyDaysAgo}`),
        );

      if (expiredUsers.length === 0) {
        return;
      }

      console.log(
        `[Scheduler] Purging ${expiredUsers.length} users that have passed the 30-day retention window.`,
      );

      const secretKey = process.env.CLERK_SECRET_KEY;
      if (!secretKey) throw new Error('CLERK_SECRET_KEY is not configured');
      const clerk = createClerkClient({ secretKey });

      for (const u of expiredUsers) {
        try {
          await clerk.users.deleteUser(u.clerkId);
        } catch (e) {
          console.error(`[Scheduler] Failed to delete user ${u.clerkId} from Clerk`, e);
        }
        await db.delete(users).where(eq(users.id, u.id));
      }

      console.log('[Scheduler] Purge complete.');
    } catch (error) {
      console.error('[Scheduler] Failed to run automated data purge:', error);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async sendTrialExpiryEmails() {
    try {
      console.log('[Scheduler] Running daily trial expiry email check...');

      // Find users whose trial ended exactly yesterday/today. 
      // Assuming a 14-day trial starts from createdAt. 
      // So createdAt is between 14 and 15 days ago.
      const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
      const fifteenDaysAgo = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);

      const expiringUsers = await db
        .select({ id: users.id, email: users.email, name: users.name })
        .from(users)
        .where(
          and(
            sql`${users.createdAt} >= ${fifteenDaysAgo}`,
            sql`${users.createdAt} < ${fourteenDaysAgo}`,
            or(eq(users.planType, 'free'), sql`${users.planType} IS NULL`)
          )
        );

      if (expiringUsers.length === 0) {
        console.log('[Scheduler] No users with expiring trials today.');
        return;
      }

      console.log(`[Scheduler] Sending trial expiry emails to ${expiringUsers.length} users.`);

      const apiKey = process.env.RESEND_API_KEY;
      if (!apiKey) throw new Error('RESEND_API_KEY is not configured');
      const resend = new (require('resend').Resend)(apiKey);

      for (const u of expiringUsers) {
        if (!u.email) continue;
        
        try {
          await resend.emails.send({
            from: 'Soouls <hello@soouls.com>',
            to: u.email,
            subject: 'Your 14-Day Free Trial has expired!',
            html: `
              <p>Hi ${u.name || 'there'},</p>
              <p>Your 14-day free trial of Soouls has come to an end.</p>
              <p>To continue enjoying premium features, please upgrade to a Premium plan today!</p>
              <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://app.soouls.com'}/pricing">Upgrade Now</a></p>
              <br/>
              <p>Best regards,<br/>The Soouls Team</p>
            `,
          });
        } catch (e) {
          console.error(`[Scheduler] Failed to send trial expiry email to ${u.email}`, e);
        }
      }

      console.log('[Scheduler] Trial expiry emails complete.');
    } catch (error) {
      console.error('[Scheduler] Failed to run trial expiry email job:', error);
    }
  }
}
