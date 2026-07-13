import { Injectable, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { render } from '@react-email/render';
import { db, eq, inArray } from '@soouls/database/client';
import { emailLogs, emailPreferences, emailSuppressions } from '@soouls/database/schema';
import { type Job, Worker } from 'bullmq';
import { Resend } from 'resend';
import { CancellationConfirmed } from './templates/CancellationConfirmed';
import { PasswordChanged } from './templates/PasswordChanged';
import { PasswordReset } from './templates/PasswordReset';
import { PaymentFailed } from './templates/PaymentFailed';
import { ReEngagementNudge } from './templates/ReEngagementNudge';
import { RefundConfirmed } from './templates/RefundConfirmed';
import { RenewalReminder } from './templates/RenewalReminder';
import { SubscriptionConfirmed } from './templates/SubscriptionConfirmed';
import { SundayReview } from './templates/SundayReview';
import { VerifyEmail } from './templates/VerifyEmail';
import { WelcomeEmail } from './templates/Welcome';

@Injectable()
export class EmailProcessor implements OnModuleInit, OnModuleDestroy {
  private worker: Worker;
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key');
  }

  onModuleInit() {
    this.worker = new Worker(
      'email',
      async (job: Job) => {
        if (job.name === 'process-email-event') {
          await this.processWebhookEvent(job);
        } else if (job.name === 'batch-send-email') {
          await this.processBatchEmails(job);
        } else {
          await this.processJob(job);
        }
      },
      {
        connection: { url: process.env.REDIS_URL },
        concurrency: 2, // Conservative concurrency to respect Resend limits
      },
    );

    this.worker.on('failed', (job, err) => {
      console.error(`[EmailProcessor] Job ${job?.id} failed:`, err);
    });
  }

  onModuleDestroy() {
    return this.worker.close();
  }

  private async processJob(job: Job) {
    const { templateName, to, idempotencyKey, data, userId, subject } = job.data;

    // 1. Idempotency check
    const [existing] = await db
      .select()
      .from(emailLogs)
      .where(eq(emailLogs.idempotencyKey, idempotencyKey))
      .limit(1);

    if (existing && existing.status !== 'failed') {
      return; // Already handled
    }

    // 2. Suppression check
    const [suppressed] = await db
      .select()
      .from(emailSuppressions)
      .where(eq(emailSuppressions.email, to))
      .limit(1);

    if (suppressed) {
      await this.upsertEmailLog({
        idempotencyKey,
        userId,
        templateName,
        status: 'skipped_suppressed',
        attempts: (existing?.attempts || 0) + 1,
      });
      return;
    }

    // 3. Render template
    let html = '';
    switch (templateName) {
      case 'welcome':
        html = await render(WelcomeEmail({ ...data, userId }));
        break;
      case 'verify-email':
        html = await render(VerifyEmail({ ...data, userId }));
        break;
      case 'password-reset':
        html = await render(PasswordReset({ ...data, userId }));
        break;
      case 'password-changed':
        html = await render(PasswordChanged({ ...data, userId }));
        break;
      case 'subscription-confirmed':
        html = await render(SubscriptionConfirmed({ ...data, userId }));
        break;
      case 'payment-failed':
        html = await render(PaymentFailed({ ...data, userId }));
        break;
      case 'renewal-reminder':
        html = await render(RenewalReminder({ ...data, userId }));
        break;
      case 'cancellation-confirmed':
        html = await render(CancellationConfirmed({ ...data, userId }));
        break;
      case 'refund-confirmed':
        html = await render(RefundConfirmed({ ...data, userId }));
        break;
      case 'sunday-review':
        html = await render(SundayReview({ ...data, userId }));
        break;
      case 're-engagement-nudge':
        html = await render(ReEngagementNudge({ ...data, userId }));
        break;
      default:
        throw new Error(`Unknown template: ${templateName}`);
    }

    // 4. Send email
    try {
      const result = await this.resend.emails.send({
        from: 'noreply@team.soouls.in',
        to,
        subject,
        html,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      // Success
      await this.upsertEmailLog({
        idempotencyKey,
        userId,
        templateName,
        status: 'sent',
        resendMessageId: result.data?.id,
        attempts: (existing?.attempts || 0) + 1,
      });
    } catch (err: any) {
      const isTransient = err?.statusCode === 429 || err?.statusCode >= 500;

      await this.upsertEmailLog({
        idempotencyKey,
        userId,
        templateName,
        status: 'failed',
        lastError: String(err),
        attempts: (existing?.attempts || 0) + 1,
      });

      if (isTransient) {
        throw err; // Let BullMQ retry
      }
      // Non-transient errors (like 4xx validation) don't throw, we just mark as failed.
    }
  }

  private async processBatchEmails(job: Job) {
    const { templateName, users } = job.data;
    const batchPayload: any[] = [];
    const validUsers: any[] = [];

    // Filter suppressions
    const emails = users.map((u: any) => u.to);
    const suppressions = await db
      .select({ email: emailSuppressions.email })
      .from(emailSuppressions)
      .where(inArray(emailSuppressions.email, emails));

    const suppressedSet = new Set(suppressions.map((s) => s.email));

    // Check global opt-outs based on template type
    const userIds = users.map((u: any) => u.userId);
    const preferences = await db
      .select()
      .from(emailPreferences)
      .where(inArray(emailPreferences.userId, userIds));
    const prefsMap = new Map(preferences.map((p) => [p.userId, p]));

    for (const u of users) {
      if (suppressedSet.has(u.to)) {
        await this.upsertEmailLog({
          idempotencyKey: u.idempotencyKey,
          userId: u.userId,
          templateName,
          status: 'skipped_suppressed',
          attempts: 1,
        });
        continue;
      }

      // Check preference overrides
      const p = prefsMap.get(u.userId);
      if (p) {
        if (templateName === 'sunday-review' && p.productDigests === false) continue;
        if (templateName === 're-engagement-nudge' && p.reEngagementNudges === false) continue;
      } else if (templateName === 're-engagement-nudge') {
        // Defaults to false if no preference row exists
        continue;
      }

      validUsers.push(u);

      let html = '';
      switch (templateName) {
        case 'sunday-review':
          html = await render(SundayReview({ ...u.data, userId: u.userId }));
          break;
        case 're-engagement-nudge':
          html = await render(ReEngagementNudge({ ...u.data, userId: u.userId }));
          break;
        // Batch API is mostly used for digests/nudges. Can add more cases as needed.
        default:
          html = '';
      }

      batchPayload.push({
        from: 'noreply@team.soouls.in',
        to: u.to,
        subject: u.subject,
        html,
      });
    }

    if (batchPayload.length === 0) return;

    try {
      const result = await this.resend.batch.send(batchPayload);

      if (result.error) {
        throw new Error(result.error.message);
      }

      const resendIds = (result.data?.data || []).map((r: any) => r.id);

      // Bulk update emailLogs
      for (let i = 0; i < validUsers.length; i++) {
        await this.upsertEmailLog({
          idempotencyKey: validUsers[i].idempotencyKey,
          userId: validUsers[i].userId,
          templateName,
          status: 'sent',
          resendMessageId: resendIds[i],
          attempts: 1,
        });
      }
    } catch (err: any) {
      console.error('[EmailProcessor] Batch send failed:', err);
      // Let it throw to trigger exponential backoff for the whole batch
      throw err;
    }
  }

  private async processWebhookEvent(job: Job) {
    const event = job.data;

    // Convert event.type (e.g. 'email.delivered') to 'delivered'
    const status = event.type.replace('email.', '');

    // Update emailLog status based on Resend Message ID
    if (event.data?.email_id) {
      await db
        .update(emailLogs)
        .set({ status, updatedAt: new Date() })
        .where(eq(emailLogs.resendMessageId, event.data.email_id));
    }

    // Handle Bounces and Complaints (Suppressions)
    if (
      (event.type === 'email.bounced' && event.data.bounce_type === 'hard') ||
      event.type === 'email.complained'
    ) {
      const email = event.data.to?.[0]; // Usually an array or string
      if (email) {
        const emailStr = typeof email === 'string' ? email : email.email;
        const reason = event.type === 'email.bounced' ? 'hard_bounce' : 'complaint';

        await db
          .insert(emailSuppressions)
          .values({
            email: emailStr,
            reason,
          })
          .onConflictDoNothing({ target: emailSuppressions.email });
      }
    }
  }

  private async upsertEmailLog(data: any) {
    // Atomic upsert
    await db
      .insert(emailLogs)
      .values({
        idempotencyKey: data.idempotencyKey,
        userId: data.userId,
        templateName: data.templateName,
        status: data.status,
        resendMessageId: data.resendMessageId,
        lastError: data.lastError,
        attempts: data.attempts,
      })
      .onConflictDoUpdate({
        target: emailLogs.idempotencyKey,
        set: {
          status: data.status,
          resendMessageId: data.resendMessageId,
          lastError: data.lastError,
          attempts: data.attempts,
          updatedAt: new Date(),
        },
      });
  }
}
