import { Module } from '@nestjs/common';
import { TrpcRouter } from './trpc.router';
import { TrpcService } from './trpc.service';

@Module({
  providers: [TrpcService, TrpcRouter],
  exports: [TrpcService, TrpcRouter],
})
export class TrpcModule {}
