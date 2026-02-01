import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiModule } from './ai/ai.module';
import { FileManagerModule } from './file-manager/file-manager.module';
import { McpModule } from './mcp/mcp.module';
import { AuthModule } from './auth/auth.module';
import { ProjectModule } from './project/project.module';
import { CollaborationModule } from './collaboration/collaboration.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { LoggingMiddleware } from './middleware/logging.middleware';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AiModule,
    FileManagerModule,
    McpModule,
    AuthModule,
    ProjectModule,
    CollaborationModule,
    MonitoringModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggingMiddleware)
      .forRoutes('*'); // Apply to all routes
  }
}
