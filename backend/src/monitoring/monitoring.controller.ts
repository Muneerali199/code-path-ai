import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MonitoringService } from './monitoring.service';
import { LoggingService } from '../logging/logging.service';

@ApiTags('Monitoring')
@Controller('monitoring')
export class MonitoringController {
  constructor(
    private readonly monitoringService: MonitoringService,
    private readonly loggingService: LoggingService,
  ) {}

  @Get('metrics')
  @ApiOperation({ summary: 'Get system metrics' })
  @ApiResponse({ status: 200, description: 'System metrics retrieved successfully' })
  getMetrics() {
    return this.monitoringService.getMetrics();
  }

  @Get('health')
  @ApiOperation({ summary: 'Get system health status' })
  @ApiResponse({ status: 200, description: 'System health status' })
  getHealthStatus() {
    return this.monitoringService.getHealthStatus();
  }

  @Get('logs')
  @ApiOperation({ summary: 'Get application logs' })
  @ApiResponse({ status: 200, description: 'Application logs retrieved successfully' })
  getLogs(
    @Body('limit') limit: number = 100,
    @Body('offset') offset: number = 0,
    @Body('filters') filters?: any
  ) {
    return this.loggingService.getLogs(limit, offset, filters);
  }

  @Post('log-info')
  @ApiOperation({ summary: 'Log an info message' })
  @ApiResponse({ status: 200, description: 'Message logged successfully' })
  logInfo(@Body() body: { message: string; context?: string; meta?: any; userId?: string }) {
    this.loggingService.info(body.message, body.context, body.meta, body.userId);
    return { success: true, message: 'Info message logged' };
  }

  @Post('log-error')
  @ApiOperation({ summary: 'Log an error message' })
  @ApiResponse({ status: 200, description: 'Error message logged successfully' })
  logError(@Body() body: { message: string; context?: string; meta?: any; userId?: string }) {
    this.loggingService.error(body.message, body.context, body.meta, body.userId);
    return { success: true, message: 'Error message logged' };
  }

  @Post('log-warn')
  @ApiOperation({ summary: 'Log a warning message' })
  @ApiResponse({ status: 200, description: 'Warning message logged successfully' })
  logWarn(@Body() body: { message: string; context?: string; meta?: any; userId?: string }) {
    this.loggingService.warn(body.message, body.context, body.meta, body.userId);
    return { success: true, message: 'Warning message logged' };
  }
}