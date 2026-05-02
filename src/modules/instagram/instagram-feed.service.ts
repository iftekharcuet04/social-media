import { Injectable, Logger } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { ConnectionPlatform } from '@prisma/client';
import { FeedIngestionService } from '../ingestion/feed-ingestion.service';
import { InstagramGraphApiClient } from './instagram-graph.api';

@Injectable()
export class InstagramFeedService {
  private readonly logger = new Logger(InstagramFeedService.name);

  constructor(
    private readonly instagramGraphApiClient: InstagramGraphApiClient,
    private readonly moduleRef: ModuleRef,
  ) {}

  /**
   * Syncs feeds for a specific Instagram User by utilizing the core FeedIngestionService.
   */
  async syncFeeds(
    connectionId: string,
    instagramUserId: string,
    accessToken: string,
    userId: string,
  ): Promise<void> {
    this.logger.log(
      `Starting feed sync for Instagram connection ${connectionId} (Instagram User ID: ${instagramUserId})`,
    );

    const fetchPageFn = async (cursor?: string) => {
      const response = await this.instagramGraphApiClient.getUserMedia(
        instagramUserId,
        accessToken,
        cursor,
      );

      const data = (response.data || []).map((item: any) => ({
        connection_id: connectionId,
        user: { connect: { uid: userId } },
        platform: ConnectionPlatform.INSTAGRAM,
        original_post_id: item.id,
        post_url: item.permalink || `https://instagram.com/p/${item.id}`,
        message: item.caption || '',
        urls: item.media_url ? [item.media_url] : [],
        status: 'PUBLISHED',
      }));

      return {
        data,
        nextCursor: response.paging?.cursors?.after,
      };
    };

    const feedIngestionService = this.moduleRef.get(FeedIngestionService, { strict: false });
    await feedIngestionService.ingestFeeds(
      ConnectionPlatform.INSTAGRAM,
      connectionId,
      userId,
      fetchPageFn,
    );

    this.logger.log(`Completed feed sync for Instagram connection ${connectionId}`);
  }
}
