import { Injectable, Logger } from '@nestjs/common';
import { ConnectionPlatform } from '@prisma/client';
import { FeedIngestionService } from '../ingestion/feed-ingestion.service';
import { FacebookGraphClient } from './facebook-graph.client';

@Injectable()
export class FacebookFeedService {
  private readonly logger = new Logger(FacebookFeedService.name);

  constructor(
    private readonly feedIngestionService: FeedIngestionService,
    private readonly facebookGraphClient: FacebookGraphClient,
  ) {}

  /**
   * Syncs feeds for a specific Facebook Page by utilizing the core FeedIngestionService.
   */
  async syncFeeds(
    connectionId: string,
    pageId: string,
    accessToken: string,
    userId: string,
  ): Promise<void> {
    this.logger.log(
      `Starting feed sync for Facebook connection ${connectionId} (Page ID: ${pageId})`,
    );

    const fetchPageFn = async (cursor?: string) => {
      const response = await this.facebookGraphClient.getPageFeed(pageId, accessToken, cursor);

      const data = (response.data || []).map((item: any) => ({
        connection_id: connectionId,
        user: { connect: { uid: userId } },
        platform: ConnectionPlatform.FACEBOOK,
        original_post_id: item.id,
        post_url: item.permalink_url || `https://facebook.com/${item.id}`,
        message: item.message || '',
        urls: item.full_picture ? [item.full_picture] : [],
        status: 'PUBLISHED',
      }));

      return {
        data,
        nextCursor: response.paging?.cursors?.after,
      };
    };

    await this.feedIngestionService.ingestFeeds(
      ConnectionPlatform.FACEBOOK,
      connectionId,
      userId,
      fetchPageFn,
    );

    this.logger.log(`Completed feed sync for Facebook connection ${connectionId}`);
  }
}
