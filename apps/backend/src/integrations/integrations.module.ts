import { Module } from '@nestjs/common';
import { GoogleIntegrationService } from './google.service';

@Module({
  providers: [GoogleIntegrationService],
  exports: [GoogleIntegrationService],
})
export class IntegrationsModule {}
