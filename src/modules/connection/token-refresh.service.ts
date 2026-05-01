import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConnectionRepository } from '../../repositories/connection.repository';
import { ConnectionService } from './connection.service';

@Injectable()
export class TokenRefreshService {
  private readonly logger = new Logger(TokenRefreshService.name);

  constructor(
    private readonly connectionRepo: ConnectionRepository,
    private readonly connectionService: ConnectionService,
  ) {}

  /**
   * Daily cron job to refresh tokens that are expiring within the next 10 days.
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleTokenRefresh() {
    this.logger.log('Starting automated token refresh check...');

    const tenDaysFromNow = new Date();
    tenDaysFromNow.setDate(tenDaysFromNow.getDate() + 10);

    const expiringConnections = await this.connectionRepo.findAll({
      where: {
        is_active: true,
        token_expires_at: {
          lte: tenDaysFromNow,
        },
      },
    });

    this.logger.log(`Found ${expiringConnections.length} connections nearing expiration.`);

    for (const connection of expiringConnections) {
      try {
        this.logger.log(
          `Refreshing token for connection ${connection.uid} (${connection.platform})`,
        );
        await this.connectionService.refreshToken(connection.id);
        this.logger.log(`Successfully refreshed token for connection ${connection.uid}`);
      } catch (error) {
        this.logger.error(
          `Failed to refresh token for connection ${connection.uid}: ${error.message}`,
        );
        // Status is already updated to DISCONNECTED inside the strategy's refreshToken method
      }
    }

    this.logger.log('Automated token refresh check completed.');
  }
}
