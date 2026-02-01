import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { FileManagerModule } from '../file-manager/file-manager.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [FileManagerModule, AiModule],
  controllers: [ProjectController],
  providers: [ProjectService],
  exports: [ProjectService],
})
export class ProjectModule {}