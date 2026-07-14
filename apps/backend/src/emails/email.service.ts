import { Injectable, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { Queue } from 'bullmq';

export type EmailTemplateName =
  | 'welcome'
  | 'verify-email'
  | 'password-reset'
  | 'password-changed'
  | 'subscription-confirmed'
  | 'payment-failed'
  | 'renewal-reminder'
  | 'cancellation-confirmed'
  | 'refund-confirmed'
  | 'sunday-review'
  | 're-engagement-nudge';

@Injectable()
export class EmailService implements OnModuleInit, OnModuleDestroy {
  private emailQueue: Queue;

  onModuleInit() {
    this.emailQueue = new Queue('email', {
      connection: {
        url: process.env.REDIS_URL,
      },
    });
  }

  onModuleDestroy() {
    return this.emailQueue.close();
  }

  async enqueueEmail(
    templateName: EmailTemplateName,
    to: string,
    idempotencyKey: string,
    data: any,
    userId: string,
    subject: string,
  ) {
    await this.emailQueue.add(
      'send-email',
      {
        templateName,
        to,
        idempotencyKey,
        data,
        userId,
        subject,
      },
      {
        jobId: idempotencyKey, // Prevents duplicate jobs from being queued
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    );
  }

  async enqueueBatchEmails(
    templateName: EmailTemplateName,
    users: { to: string; userId: string; data: any; subject: string; idempotencyKey: string }[],
  ) {
    const chunkSize = 100; // Resend limit per batch
    for (let i = 0; i < users.length; i += chunkSize) {
      const chunk = users.slice(i, i + chunkSize);

      const jobId = `batch-${templateName}-${Date.now()}-${i}`;

      await this.emailQueue.add(
        'batch-send-email',
        { templateName, users: chunk },
        {
          jobId,
          attempts: 3,
          backoff: { type: 'exponential', delay: 5000 },
        },
      );
    }
  }
}
