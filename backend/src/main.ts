import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { MonitoringService } from './monitoring/monitoring.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend
  app.enableCors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      'http://localhost:8080'
    ],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe());

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('CodePath AI Coach API')
    .setDescription('AI-powered development environment backend')
    .setVersion('1.0')
    .addTag('ai')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Get monitoring service to track app lifecycle
  const monitoringService = app.get(MonitoringService);

  // Track server startup
  console.log('🚀 Initializing CodePath AI Coach Backend...');
  monitoringService.incrementRequestCount(); // Count startup as a request

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`🚀 Backend running on http://localhost:${port}`);
  console.log(`📚 API docs available at http://localhost:${port}/api`);

  // Log server startup
  console.log('✅ Server initialized successfully');
}

bootstrap();
