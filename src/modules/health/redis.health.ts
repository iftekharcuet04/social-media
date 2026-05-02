import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(private readonly configService: ConfigService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const host = this.configService.get<string>('app.redisHost');
    const port = this.configService.get<number>('app.redisPort');

    const client = new Redis({ host, port, lazyConnect: true });

    try {
      await client.connect();
      await client.ping();
      await client.quit();
      return this.getStatus(key, true, { host, port });
    } catch (error: any) {
      await client.quit().catch(() => {});
      throw new HealthCheckError(
        'Redis check failed',
        this.getStatus(key, false, { error: error.message }),
      );
    }
  }
}
