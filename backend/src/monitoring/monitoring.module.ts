import { Module } from '@nestjs/common';
import { MonitoringService } from './monitoring.service';
import { LoggingService } from '../logging/logging.service';
import { MonitoringController } from './monitoring.controller';

@Module({
  controllers: [MonitoringController],
  providers: [MonitoringService, LoggingService],
  exports: [MonitoringService, LoggingService],
})
export class MonitoringModule {}