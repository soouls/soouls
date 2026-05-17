import { Module } from '@nestjs/common';
import { IntegrationsModule } from '../integrations/integrations.module';
import { ServicesModule } from '../services/services.module';
import { UsersService } from './users.service';

@Module({
  imports: [ServicesModule, IntegrationsModule],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
