import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { EnhancedAiService } from './enhanced-ai.service';
import { EnhancedAiController } from './enhanced-ai.controller';
import { VscodeAiController } from './vscode-ai.controller';
import { VscodeAiService } from './vscode-ai.service';
import { ResearchService } from './research.service';

@Module({
  imports: [
    ConfigModule,
    AuthModule, // Import AuthModule to access ApiKeyAuthService and ApiKeyGuard
  ],
  controllers: [AiController, EnhancedAiController, VscodeAiController],
  providers: [AiService, EnhancedAiService, VscodeAiService, ResearchService],
  exports: [AiService, EnhancedAiService, VscodeAiService, ResearchService],
})
export class AiModule {}
