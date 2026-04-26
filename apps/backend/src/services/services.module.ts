import { Module } from '@nestjs/common';
import { EntriesService } from '../entries/entries.service';
import { HomeService } from '../home/home.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { RedisModule } from '../redis/redis.module';
import { TasksService } from '../tasks/tasks.service';
import { MessagingService } from './messaging.service';

@Module({
  imports: [NotificationsModule, RedisModule],
  providers: [EntriesService, HomeService, TasksService, MessagingService],
  exports: [EntriesService, HomeService, TasksService, MessagingService],
})
export class ServicesModule {}
