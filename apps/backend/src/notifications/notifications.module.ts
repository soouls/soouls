import { Module } from '@nestjs/common';
import { isVercelRuntime } from '../runtime';
import { NotificationDispatchService } from './notification-dispatch.service';
import { NotificationQueueService } from './notification.queue';
import { NotificationWorker } from './notification.worker';
import { NotificationsController } from './notifications.controller';

import { ResendProvider } from './resend.provider';

@Module({
  controllers: [NotificationsController],
  providers: [
    ResendProvider,
    NotificationQueueService,
    NotificationDispatchService,
    ...(isVercelRuntime ? [] : [NotificationWorker]),
  ],
  exports: [NotificationDispatchService, NotificationQueueService],
})
export class NotificationsModule {}
