import { Module } from '@nestjs/common';
import { ServicesModule } from '../services/services.module';
import { TrpcController } from './trpc.controller';
import { TrpcRouter } from './trpc.router';

@Module({
  imports: [ServicesModule],
  controllers: [TrpcController],
  providers: [TrpcRouter],
  exports: [TrpcRouter],
})
export class TrpcModule {}
