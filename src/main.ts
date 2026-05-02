import { Logger as NestLogger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import 'reflect-metadata';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Use Pino as the global logger
  app.useLogger(app.get(Logger));

  const logger = new NestLogger('Bootstrap');

  try {
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    const config = new DocumentBuilder()
      .setTitle('Social Media API')
      .setDescription('The social media management API')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    const port = process.env.PORT || 3000;
    await app.listen(port, '0.0.0.0');
    logger.log(`Server running on port ${port}`);
    logger.log(`Swagger: http://localhost:3001/api`);
    logger.log(`BullBoard: http://localhost:3001/admin/queues`);
    logger.log(`Health: http://localhost:3001/health`);
  } catch (error) {
    logger.error('Error during bootstrap', error);
    process.exit(1);
  }
}
bootstrap();
