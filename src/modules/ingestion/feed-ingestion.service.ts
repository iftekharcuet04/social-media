import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConcurrencyLimiterService } from '../../common/services/concurrency-limiter.service';
import { PostRepository } from '../../repositories/post.repository';
import { ConnectionPlatform, Prisma } from '@prisma/client';
import { ITokenRefresher, TOKEN_REFRESHER } from '../interfaces/token-refresher.interface';
import { SocialMediaAuthException, SocialMediaException } from '../../common/exceptions/social-media.exception';

export interface FeedFetchResult {
  data: Prisma.SocialPostCreateInput[];
  nextCursor?: string;
}

@Injectable()
export class FeedIngestionService {
  private readonly logger = new Logger(FeedIngestionService.name);

  constructor(
    private readonly postRepository: PostRepository,
    private readonly concurrencyLimiter: ConcurrencyLimiterService,
    @Inject(TOKEN_REFRESHER)
    private readonly tokenRefresher: ITokenRefresher,
  ) {}

  /**
   * High-throughput ingestion of social feeds using recursive retry with exponential backoff.
   *
   * @param platform The social media platform
   * @param connectionId The connection ID
   * @param fetchPageFn Function to fetch a single page of data. Returns the mapped data and an optional next cursor.
   */
  async ingestFeeds(
    platform: ConnectionPlatform,
    connectionId: string,
    userId: string,
    fetchPageFn: (cursor?: string) => Promise<FeedFetchResult>,
  ): Promise<void> {
    await this.fetchAndIngestRecursive(platform, connectionId, userId, fetchPageFn);
  }

  private async fetchAndIngestRecursive(
    platform: ConnectionPlatform,
    connectionId: string,
    userId: string,
    fetchPageFn: (cursor?: string) => Promise<FeedFetchResult>,
    cursor?: string,
    retryCount = 0,
  ): Promise<void> {
    try {
      if (retryCount > 0) {
        // Exponential backoff
        const backoffMs = Math.pow(2, retryCount) * 1000;
        this.logger.warn(
          `Retrying fetch for connection ${connectionId} on ${platform} (Attempt ${retryCount}) after ${backoffMs}ms`,
        );
        await this.delay(backoffMs);
      }

      // Fetch the page
      const { data, nextCursor } = await fetchPageFn(cursor);

      // Ingest the fetched data concurrently using ConcurrencyLimiter to respect DB pool limits
      await Promise.all(
        data.map((item) =>
          this.concurrencyLimiter.run(async () => {
            // Ensure userId is set on every item
            (item as any).user = { connect: { uid: userId } };

            // Check if post already exists to prevent duplicates
            if (item.original_post_id) {
              const existingPost = await this.postRepository.findFirst({
                where: {
                  user_id: userId,
                  connection_id: item.connection_id,
                  platform: item.platform,
                  original_post_id: item.original_post_id,
                },
              });

              if (existingPost) {
                // Update existing post
                return this.postRepository.update({
                  where: { id: existingPost.id },
                  data: item,
                });
              }
            }

            // Create new post
            return this.postRepository.create({ data: item });
          }),
        ),
      );

      // Fetch the next page recursively
      if (nextCursor) {
        await this.fetchAndIngestRecursive(
          platform,
          connectionId,
          userId,
          fetchPageFn,
          nextCursor,
          0,
        ); // Reset retryCount
      }
    } catch (error: any) {
      const MAX_RETRIES = 5;

      const isRetryable = error instanceof SocialMediaException ? error.isRetryable : false;
      const isUnauthorized = error instanceof SocialMediaAuthException;

      if (isRetryable && retryCount < MAX_RETRIES) {
        this.logger.warn(
          `Retryable error encountered during fetch for connection ${connectionId}: ${error.message}`,
        );
        await this.fetchAndIngestRecursive(
          platform,
          connectionId,
          userId,
          fetchPageFn,
          cursor,
          retryCount + 1,
        );
      } else if (isUnauthorized) {
        await this.handleUnauthorizedAndRetry(platform, connectionId, userId, fetchPageFn, cursor);
      } else {
        this.logger.error(
          `Failed to ingest feeds for connection ${connectionId} after ${retryCount} retries. Error: ${error.message}`,
          error.stack,
        );
        throw error;
      }
    }
  }


  private async handleUnauthorizedAndRetry(
    platform: ConnectionPlatform,
    connectionId: string,
    userId: string,
    fetchPageFn: (cursor?: string) => Promise<FeedFetchResult>,
    cursor?: string,
  ): Promise<void> {
    this.logger.warn(
      `Unauthorized error for ${platform} (${connectionId}). Attempting token refresh and retry...`,
    );

    try {
      await this.tokenRefresher.refreshToken(BigInt(connectionId));

      // Retry the fetch and ingest recursively
      return await this.fetchAndIngestRecursive(
        platform,
        connectionId,
        userId,
        fetchPageFn,
        cursor,
        0,
      );
    } catch (refreshError: any) {
      this.logger.error(
        `Token refresh failed for connection ${connectionId}: ${refreshError.message}`,
      );
      throw refreshError;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

}
