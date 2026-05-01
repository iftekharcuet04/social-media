import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ConnectionAuthStrategy, AuthCallbackParams } from '../interfaces/auth-strategy';
import { ConnectionRepository } from '../../repositories/connection.repository';

@Injectable()
export class ConnectionService {
  constructor(
    @Inject('AUTH_STRATEGIES')
    private readonly strategies: ConnectionAuthStrategy[],
    private readonly connectionRepository: ConnectionRepository,
  ) {}

  private getStrategy(platform: string): ConnectionAuthStrategy {
    const strategy = this.strategies.find((s) => s.platform.toUpperCase() === platform.toUpperCase());
    if (!strategy) {
      throw new NotFoundException(`Platform ${platform} not supported for authentication`);
    }
    return strategy;
  }

  async getConnectUrl(platform: string, userId: string, redirectUri?: string): Promise<string> {
    const strategy = this.getStrategy(platform);
    return await strategy.getLoginUrl(userId, redirectUri);
  }

  async handleCallback(platform: string, params: AuthCallbackParams): Promise<void> {
    const strategy = this.getStrategy(platform);
    await strategy.handleCallback(params);
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
