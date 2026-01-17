import { Injectable } from '@nestjs/common';
import { appRouter } from '@soulcanvas/api/router';
import type { TrpcService } from './trpc.service';

@Injectable()
export class TrpcRouter {
  constructor(private readonly trpc: TrpcService) {}

  appRouter = appRouter;
}
