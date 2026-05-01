import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class ConcurrencyLimiterService {
  private readonly logger = new Logger(ConcurrencyLimiterService.name);

  private readonly MAX_ACTIVE_CONNECTIONS = parseInt(process.env.DB_CONCURRENCY || '20', 10);
  private readonly MAX_TOTAL_CAPACITY = 150;

  private activeQueries = 0;
  private queue: (() => void)[] = [];

  async run<T>(fn: () => Promise<T>): Promise<T> {
    const totalLoad = this.activeQueries + this.queue.length;

    if (totalLoad >= this.MAX_TOTAL_CAPACITY) {
      this.logger.error(
        `Critical Saturation: Active=${this.activeQueries}, Queue=${this.queue.length}. ` +
          `Refusing new query with 429 (Max Capacity: ${this.MAX_TOTAL_CAPACITY}).`,
      );
      throw new HttpException('DATABASE_SATURATION_OVERFLOW', HttpStatus.TOO_MANY_REQUESTS);
    }

    await this.acquire();
    try {
      return await fn();
    } finally {
      this.release();
    }
  }

  private async acquire(): Promise<void> {
    if (this.activeQueries < this.MAX_ACTIVE_CONNECTIONS) {
      this.activeQueries++;
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      this.queue.push(resolve);
      if (this.queue.length % 10 === 0) {
        this.logger.warn(
          `Database Connection Pool Full (Limit: ${this.MAX_ACTIVE_CONNECTIONS}). ` +
            `Query queued (Waiting: ${this.queue.length}).`,
        );
      }
    });
  }

  private release(): void {
    this.activeQueries--;
    if (this.queue.length > 0) {
      const next = this.queue.shift();
      if (next) {
        this.activeQueries++;
        next();
      }
    }
  }
}
