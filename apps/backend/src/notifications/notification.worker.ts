import { Inject, Injectable, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { type Job, Worker } from 'bullmq';
// biome-ignore lint/style/useImportType: Nest uses this class as a runtime injection token.
import { NotificationDispatchService } from './notification-dispatch.service';
import {
  NOTIFICATIONS_QUEUE,
  type NotificationJobData,
  type NotificationJobName,
  createRedisConnection,
} from './notification.constants';

@Injectable()
export class NotificationWorker implements OnModuleInit, OnModuleDestroy {
  private readonly connection = createRedisConnection();
  private worker: Worker<NotificationJobData, void, NotificationJobName> | null = null;

  constructor(private readonly dispatcher: NotificationDispatchService) {}

  onModuleInit() {
    if (!this.connection) {
      console.warn('[Notifications] REDIS_URL is not configured. Worker is disabled.');
      return;
    }

    this.worker = new Worker<NotificationJobData, void, NotificationJobName>(
      NOTIFICATIONS_QUEUE,
      async (job) => this.processJob(job),
      {
        connection: this.connection,
        concurrency: Number(process.env.NOTIFICATION_WORKER_CONCURRENCY ?? 10),
      },
    );

    this.worker.on('failed', (job, error) => {
      console.error('[Notifications] Job failed', {
        id: job?.id,
        name: job?.name,
        error,
      });
    });
  }

  private async processJob(job: Job<NotificationJobData, void, NotificationJobName>) {
    await this.dispatcher.processJob(job.name, job.data);
  }

  async onModuleDestroy() {
    await this.worker?.close();
  }
}
