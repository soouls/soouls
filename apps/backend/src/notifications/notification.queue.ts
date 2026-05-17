import { Injectable, type OnModuleDestroy } from '@nestjs/common';
import { Client } from '@upstash/qstash';
import { type JobsOptions, Queue } from 'bullmq';
import { isVercelRuntime } from '../runtime';
import {
  NOTIFICATIONS_QUEUE,
  type NotificationJobData,
  type NotificationJobName,
  QSTASH_RETRY_COUNT,
  createRedisConnection,
  getBackendPublicUrl,
} from './notification.constants';

const DEFAULT_JOB_OPTIONS: JobsOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 2_000,
  },
  removeOnComplete: 200,
  removeOnFail: 200,
};

@Injectable()
export class NotificationQueueService implements OnModuleDestroy {
  // Skip BullMQ queue creation on Vercel serverless — the Redis TCP connection
  // hangs the cold start and workers can't run in serverless anyway.
  private readonly connection = isVercelRuntime ? null : createRedisConnection();
  private readonly queue = this.connection
    ? new Queue<NotificationJobData, void, NotificationJobName>(NOTIFICATIONS_QUEUE, {
        connection: this.connection,
        defaultJobOptions: DEFAULT_JOB_OPTIONS,
      })
    : null;
  private readonly qstash =
    process.env.QSTASH_TOKEN && getBackendPublicUrl()
      ? new Client({ token: process.env.QSTASH_TOKEN })
      : null;

  isConfigured() {
    return this.queue !== null || this.qstash !== null;
  }

  async add(name: NotificationJobName, data: NotificationJobData) {
    if (this.qstash) {
      const backendUrl = getBackendPublicUrl();
      const url = new URL(`/notifications/jobs/${name}`, backendUrl).toString();

      return this.qstash.publishJSON({
        url,
        body: data,
        deduplicationId: `${name}:${JSON.stringify(data)}`,
        retries: QSTASH_RETRY_COUNT,
        label: `notifications:${name}`,
      });
    }

    if (!this.queue) {
      throw new Error(
        'Notifications queue is not configured. Set QSTASH_TOKEN and BACKEND_PUBLIC_URL, or REDIS_URL.',
      );
    }

    return this.queue.add(name, data, {
      jobId: `${name}:${JSON.stringify(data)}`,
    });
  }

  async enqueueWelcomeSequence(userId: string) {
    return this.add('welcome-sequence', { userId });
  }

  async enqueueSecureAccess(email: string) {
    return this.add('secure-access', { email });
  }

  async enqueueAdminInvite(inviteId: string) {
    return this.add('admin-invite', { inviteId });
  }

  async enqueueCampaignDispatch(campaignId: string) {
    return this.add('campaign-dispatch', { campaignId });
  }

  async enqueueGdprExport(userId: string, requestorEmail: string) {
    return this.add('gdpr-export', { userId, requestorEmail });
  }

  async getCounts() {
    if (this.qstash && !this.queue) {
      return {
        waiting: 0,
        active: 0,
        delayed: 0,
        failed: 0,
      };
    }

    if (!this.queue) {
      return {
        waiting: 0,
        active: 0,
        delayed: 0,
        failed: 0,
      };
    }

    const [waiting, active, delayed, failed] = await Promise.all([
      this.queue.getWaitingCount(),
      this.queue.getActiveCount(),
      this.queue.getDelayedCount(),
      this.queue.getFailedCount(),
    ]);

    return {
      waiting,
      active,
      delayed,
      failed,
    };
  }

  async onModuleDestroy() {
    await this.queue?.close();
  }
}
