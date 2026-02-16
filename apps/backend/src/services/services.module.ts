import { Module } from '@nestjs/common';
import { EntriesService } from '../entries/entries.service';
import { TasksService } from '../tasks/tasks.service';

@Module({
  providers: [EntriesService, TasksService],
  exports: [EntriesService, TasksService],
})
export class ServicesModule {}
