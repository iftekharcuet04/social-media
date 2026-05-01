import { Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConnectionAuthStrategy, AuthCallbackParams } from '../interfaces/auth-strategy';
import { ConnectionRepository } from '../../repositories/connection.repository';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class ConnectionService {
  constructor(
    @Inject('AUTH_STRATEGIES')
    private readonly strategies: ConnectionAuthStrategy[],
    private readonly connectionRepository: ConnectionRepository,
    private readonly jwtService: JwtService,
  ) {}

  private getStrategy(platform: string): ConnectionAuthStrategy {
    const strategy = this.strategies.find(
      (s) => s.platform.toUpperCase() === platform.toUpperCase(),
    );
    if (!strategy) {
      throw new NotFoundException(`Platform ${platform} not supported for authentication`);
    }
    return strategy;
  }

  async getConnectUrl(platform: string, userId: string, redirectUri?: string): Promise<string> {
    const strategy = this.getStrategy(platform);

    // Task 5: Sign the state for CSRF protection
    const signedState = this.jwtService.sign({ userId, platform }, { expiresIn: '15m' });

    return await strategy.getLoginUrl(signedState, redirectUri);
  }

  async handleCallback(platform: string, params: AuthCallbackParams): Promise<void> {
    // Task 5: Verify the state (CSRF Protection)
    try {
      const decoded = this.jwtService.verify(params.state);
      if (decoded.userId !== params.userId || decoded.platform !== platform) {
        throw new UnauthorizedException('Invalid OAuth state (CSRF detected)');
      }
    } catch (_error) {
      throw new UnauthorizedException('Invalid or expired OAuth state');
    }

    const strategy = this.getStrategy(platform);
    await strategy.handleCallback(params);

    // Task 7: Trigger background Feed Sync after connection (don't await)
    strategy.syncFeeds(params.userId).catch((err) => {
      console.error(`Background feed sync failed for user ${params.userId} on ${platform}:`, err);
    });
  }

  async refreshToken(connectionId: bigint): Promise<void> {
    const connection = await this.connectionRepository.findUnique({
      where: { id: connectionId },
    });

    if (!connection) {
      throw new NotFoundException('Connection not found');
    }

    const strategy = this.getStrategy(connection.platform);
    await strategy.refreshToken(connectionId);
  }

  async listConnections(userId: string) {
    return this.connectionRepository.findAll({
      where: { user_id: userId, is_active: true },
    });
  }

  async disconnect(userId: string, connectionId: bigint) {
    return this.connectionRepository.updateMany({
      where: { id: connectionId, user_id: userId },
      data: { is_active: false, status: 'DISCONNECTED' as const },
    });
  }
}
