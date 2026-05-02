import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConcurrencyLimiterService } from '../common/services/concurrency-limiter.service';

@Injectable()
export class PrismaOverrideService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaOverrideService.name);
  private readonly limiter = new ConcurrencyLimiterService();
  private readonly QUERY_TIMEOUT_MS = 2000;
  public readonly client;

  constructor() {
    const baseClient = new PrismaClient();

    this.client = baseClient.$extends({
      query: {
        $allOperations: async ({ model, operation, args, query }) => {
          const startTime = Date.now();

          const result = await this.limiter.run(async () => {
            return await query(args);
          });

          const duration = Date.now() - startTime;
          if (duration > this.QUERY_TIMEOUT_MS) {
            this.logger.warn(`CRITICAL: Query ${model}.${operation} took ${duration}ms!`);
          }

          // Handle binary UID to hex conversion if present (matching boilerplate middleware)
          return this.handleResult(result);
        },
      },
    });
  }

  private handleResult(result: any) {
    if (Array.isArray(result)) {
      return result.map((item) => this.transformItem(item));
    }
    return this.transformItem(result);
  }

  private transformItem(item: any) {
    if (item && item.uid && Buffer.isBuffer(item.uid)) {
      item.uid = item.uid.toString('hex');
    }
    return item;
  }

  async onModuleInit() {
    if (!this.client || process.env.NODE_ENV === 'test') {
      this.logger.log('Skipping DB connection in test environment');
      return;
    }

    const url = process.env.DATABASE_URL;
    this.logger.log(`Connecting to database at ${url?.split('@')[1] || 'unknown'}...`);
    try {
      await (this.client as any).$connect();
      this.logger.log('PrismaOverrideService connected');
    } catch (error: any) {
      this.logger.error(`Failed to connect to database: ${error.message}`);
      // Don't throw here to allow app to start even if DB is down (or handled elsewhere)
      // Actually, Nest will still wait if this is in onModuleInit
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await (this.client as any).$disconnect();
    }
  }
}
