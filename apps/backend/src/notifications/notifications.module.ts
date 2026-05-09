import { Module } from '@nestjs/common';
import { isVercelRuntime } from '../runtime';
import { NotificationDispatchService } from './notification-dispatch.service';
import { NotificationQueueService } from './notification.queue';
import { NotificationWorker } from './notification.worker';

@Module({
  providers: [
    NotificationQueueService,
    NotificationDispatchService,
    ...(isVercelRuntime ? [] : [NotificationWorker]),
  ],
  exports: [NotificationDispatchService, NotificationQueueService],
})
export class NotificationsModule {}
