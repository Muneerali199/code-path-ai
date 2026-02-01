import { Module } from '@nestjs/common';
import { McpService } from './mcp.service';
import { McpController } from './mcp.controller';
import { AiModule } from '../ai/ai.module';
import { FileManagerModule } from '../file-manager/file-manager.module';

@Module({
  imports: [AiModule, FileManagerModule],
  controllers: [McpController],
  providers: [McpService],
  exports: [McpService],
})
export class McpModule {}