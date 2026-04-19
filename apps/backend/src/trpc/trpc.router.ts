import { Inject, Injectable } from '@nestjs/common';
import { createAppRouter } from '@soouls/api/router';
import type { AppRouter, EntriesApi, MessagingApi, ProfileApi } from '@soouls/api/router';
import { EntriesService } from '../entries/entries.service';
import { MessagingService } from '../services/messaging.service';
import { TasksService } from '../tasks/tasks.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class TrpcRouter {
  public readonly appRouter: AppRouter;

  constructor(
    @Inject(EntriesService) private readonly entriesService: EntriesService,
    @Inject(MessagingService) private readonly messagingService: MessagingService,
    @Inject(TasksService) private readonly tasksService: TasksService,
    @Inject(UsersService) private readonly usersService: UsersService,
  ) {
    this.appRouter = createAppRouter({
      entries: this.entriesService as unknown as EntriesApi,
      messaging: this.messagingService as unknown as MessagingApi,
      profile: this.usersService as unknown as ProfileApi,
      tasks: this.tasksService,
      users: this.usersService,
    });
  }
}
