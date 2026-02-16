import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServicesModule } from './services/services.module';
import { TrpcModule } from './trpc/trpc.module';

@Module({
  imports: [ScheduleModule.forRoot(), ServicesModule, TrpcModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
