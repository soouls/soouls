import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SentryModule } from '@sentry/nestjs/setup';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommandCenterModule } from './command-center/command-center.module';
import { EmailsModule } from './emails/emails.module';
import { GoogleCalendarModule } from './google-calendar/google-calendar.module';
import { RedisModule } from './redis/redis.module';
import { isVercelRuntime } from './runtime';
import { ServicesModule } from './services/services.module';
import { TrpcModule } from './trpc/trpc.module';
import { UsersModule } from './users/users.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [
    SentryModule.forRoot(),
    ...(isVercelRuntime ? [] : [ScheduleModule.forRoot()]),
    RedisModule,
    ServicesModule,
    TrpcModule,
    UsersModule,
    CommandCenterModule,
    GoogleCalendarModule,
    PaymentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
