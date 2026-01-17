import { Injectable } from '@nestjs/common';
import { initTRPC } from '@trpc/server';

@Injectable()
export class TrpcService {
  trpc = initTRPC.context().create();
  procedure = this.trpc.procedure;
  router = this.trpc.router;
  mergeRouters = this.trpc.mergeRouters;
}
