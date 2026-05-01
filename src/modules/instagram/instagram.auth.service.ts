import { Injectable } from '@nestjs/common';
import { ConnectionRepository } from '../../repositories/connection.repository';
import { InstagramGraphApiClient } from './instagram-graph.api';
import { ConnectionAuthStrategy, AuthCallbackParams } from '../interfaces/auth-strategy';
import { PlatformSettingRepository } from '../../repositories/platform-setting.repository';
import { ConnectionPlatform } from '@prisma/client';

import { InstagramFeedService } from './instagram-feed.service';

@Injectable()
export class InstagramAuthService implements ConnectionAuthStrategy {
  readonly platform = 'INSTAGRAM';

  constructor(
    private readonly instagramGraphClient: InstagramGraphApiClient,
    private readonly connectionRepo: ConnectionRepository,
    private readonly platformSettingRepo: PlatformSettingRepository,
    private readonly instagramFeedService: InstagramFeedService,
  ) {}

  async getLoginUrl(userId: string): Promise<string> {
    const settings = await this.platformSettingRepo.getByPlatform(ConnectionPlatform.INSTAGRAM);
    if (!settings) throw new Error('Instagram platform settings not found in database');

    const scopes = 'user_profile,user_media';

    return this.instagramGraphClient.buildLoginurl({
      clientId: settings.client_id,
      redirectUri: settings.redirect_uri,
      scopes,
      state: userId,
    });
  }

  async handleCallback(params: AuthCallbackParams): Promise<void> {
    const settings = await this.platformSettingRepo.getByPlatform(ConnectionPlatform.INSTAGRAM);
    if (!settings) throw new Error('Instagram platform settings not found in database');

    const { access_token } = await this.instagramGraphClient.getShortLivedToken({
      clientId: settings.client_id,
      clientSecret: settings.client_secret,
      redirectUri: settings.redirect_uri,
      code: params.code,
    });

    const instagramUser = await this.instagramGraphClient.getUserInfo(access_token);

    const longLivedToken = await this.instagramGraphClient.getLongLivedToken({
      shortLivedToken: access_token,
      clientSecret: settings.client_secret,
    });

    const processInfo = {
      access_token: longLivedToken.access_token,
      user_id: instagramUser.user_id,
      name: instagramUser.name,
      email: instagramUser.email,
      username: instagramUser.username,
      userId: params.userId,
    };

    await this.savecredentials(processInfo);
  }

  async refreshToken(connectionId: bigint): Promise<void> {
    const connection = await this.connectionRepo.findUnique({
      where: { id: connectionId },
    });

    if (!connection || !connection.access_token) return;

    try {
      const settings = await this.platformSettingRepo.getByPlatform(ConnectionPlatform.INSTAGRAM);
      if (!settings) throw new Error('Instagram platform settings not found in database');

      const data = await this.instagramGraphClient.getLongLivedToken({
        shortLivedToken: connection.access_token,
        clientSecret: settings.client_secret,
      });

      await this.connectionRepo.update({
        where: { id: connectionId },
        data: {
          access_token: data.access_token,
          token_expires_at: data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : null,
          status: 'CONNECTED',
        },
      });
    } catch (error) {
      await this.connectionRepo.update({
        where: { id: connectionId },
        data: { status: 'DISCONNECTED', is_active: false },
      });
      throw error;
    }
  }

  async syncFeeds(userId: string): Promise<void> {
    const connections = await this.connectionRepo.findAll({
      where: { user_id: userId, platform: 'INSTAGRAM', is_active: true },
    });

    for (const connection of connections) {
      try {
        await this.instagramFeedService.syncFeeds(
          connection.uid,
          connection.original_id,
          connection.access_token,
          userId,
        );
      } catch (error) {
        console.error(`Failed to sync feeds for IG connection ${connection.uid}:`, error);
      }
    }
  }

  async savecredentials(data: any) {
    const connectionData = {
      email: data.email,
      name: data.name,
      access_token: data.access_token,
      type: 'PROFILE' as const,
      platform: 'INSTAGRAM' as const,
      original_id: data.user_id,
      user: { connect: { uid: data.userId } },
      metadata: {
        username: data.username,
      },
      status: 'CONNECTED' as const,
    };

    await this.connectionRepo.upsert({
      where: {
        user_id_platform_original_id: {
          user_id: data.userId,
          platform: connectionData.platform,
          original_id: connectionData.original_id,
        },
      },
      update: {
        access_token: connectionData.access_token,
        name: connectionData.name,
        metadata: connectionData.metadata,
        status: 'CONNECTED',
        is_active: true,
      },
      create: connectionData,
    });
  }
}
