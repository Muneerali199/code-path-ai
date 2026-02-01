import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { EnhancedAiService } from './enhanced-ai.service';
import { EnhancedAiController } from './enhanced-ai.controller';
import { ResearchService } from './research.service';

@Module({
  imports: [
    ConfigModule,
  ],
  controllers: [AiController, EnhancedAiController],
  providers: [AiService, EnhancedAiService, ResearchService],
  exports: [AiService, EnhancedAiService, ResearchService],
})
export class AiModule {}
