import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { PrismaOverrideService } from '../../prisma/prisma.service';

@Injectable()
export class PrismaHealthIndicator extends HealthIndicator {
  constructor(private readonly prisma: PrismaOverrideService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      await (this.prisma as any).$queryRaw`SELECT 1`;
      return this.getStatus(key, true);
    } catch (error: any) {
      throw new HealthCheckError(
        'Database check failed',
        this.getStatus(key, false, { error: error.message }),
      );
    }
  }
}
