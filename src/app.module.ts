import { ExpressAdapter } from '@bull-board/express';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullModule } from '@nestjs/bullmq';
import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';
import apiConfig from './config/api.config';
import appConfig from './config/app.config';
import { AuthModule } from './modules/auth/auth.module';
import { ConnectionModule } from './modules/connection/connection.module';
import { HealthModule } from './modules/health/health.module';
import { IngestionModule } from './modules/ingestion/ingestion.module';
import { QueueModule } from './modules/queue/queue.module';
import { SocialMediaPostModule } from './modules/social-media-post/social-media.module';
import { PrismaOverrideModule } from './prisma/prisma.module';
import { RepositoryModule } from './repositories/repository.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [appConfig, apiConfig],
      isGlobal: true,
      cache: true,
    }),
    PrismaOverrideModule,
    RepositoryModule,
    SocialMediaPostModule,
    CommonModule,
    IngestionModule,
    AuthModule,
    ConnectionModule,
    ScheduleModule.forRoot(),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const host = configService.get('app.redisHost');
        const port = configService.get('app.redisPort');
        return {
          connection: {
            host,
            port,
            maxRetriesPerRequest: null,
          },
          defaultWorkerOptions: {
            connection: { host, port },
          },
        };
      },
    }),
    BullBoardModule.forRoot({
      route: '/queues',
      adapter: ExpressAdapter,
    }),
    QueueModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty', options: { singleLine: true } }
            : undefined,
      },
    }),
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements OnModuleInit {
  private readonly logger = new Logger(AppModule.name);

  onModuleInit() {
    this.logger.log('AppModule initialized.');
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl && !dbUrl.includes('connection_limit=')) {
      this.logger.warn(
        "DATABASE_URL does not contain 'connection_limit'. " +
        "Add '?connection_limit=20' to prevent connection exhaustion.",
      );
    }
  }
}
