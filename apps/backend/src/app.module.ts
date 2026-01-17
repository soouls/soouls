import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TrpcController } from './trpc/trpc.controller';
import { TrpcModule } from './trpc/trpc.module';

@Module({
  imports: [TrpcModule],
  controllers: [AppController, TrpcController],
  providers: [AppService],
})
export class AppModule {}
