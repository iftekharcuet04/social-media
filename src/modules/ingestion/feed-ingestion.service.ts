import { Injectable, Logger } from '@nestjs/common';
import { ConcurrencyLimiterService } from '../../common/services/concurrency-limiter.service';
import { PostRepository } from '../../repositories/post.repository';
import { ConnectionPlatform, Prisma } from '@prisma/client';

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
    fetchPageFn: (cursor?: string) => Promise<FeedFetchResult>
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
          `Retrying fetch for connection ${connectionId} on ${platform} (Attempt ${retryCount}) after ${backoffMs}ms`
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
          })
        )
      );

      // Fetch the next page recursively
      if (nextCursor) {
        await this.fetchAndIngestRecursive(platform, connectionId, userId, fetchPageFn, nextCursor, 0); // Reset retryCount
      }
    } catch (error) {
      const MAX_RETRIES = 5;

      if (this.isRetryableError(error) && retryCount < MAX_RETRIES) {
        this.logger.warn(
          `Retryable error encountered during fetch for connection ${connectionId}: ${error.message}`
        );
        await this.fetchAndIngestRecursive(platform, connectionId, userId, fetchPageFn, cursor, retryCount + 1);
      } else {
        this.logger.error(
          `Failed to ingest feeds for connection ${connectionId} after ${retryCount} retries. Error: ${error.message}`,
          error.stack
        );
        throw error;
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private isRetryableError(error: any): boolean {
    // Basic logic to determine if an error is retryable (e.g., HTTP 429, 5xx)
    // Works with AxiosError structure or standard HTTP status codes
    const status = error.response?.status || error.status;
    
    if (status) {
      return status === 429 || (status >= 500 && status <= 599);
    }

    // Network errors like ECONNRESET, ENOTFOUND, ETIMEDOUT are generally retryable
    const code = error.code;
    if (code && ['ECONNRESET', 'ENOTFOUND', 'ETIMEDOUT', 'ECONNREFUSED'].includes(code)) {
      return true;
    }

    // Default to true for safety in this basic implementation, 
    // ideally refine based on specific third-party API error responses
    return true; 
  }
}
