import { Module } from '@nestjs/common';
import { EmailProcessor } from './email.processor';
import { EmailService } from './email.service';
import { EmailsController } from './emails.controller';

@Module({
  controllers: [EmailsController],
  providers: [EmailService, EmailProcessor],
  exports: [EmailService],
})
export class EmailsModule {}
