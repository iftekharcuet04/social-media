import { Inject, Injectable } from '@nestjs/common';
import {
  CreatePostParams,
  DeletePostParams,
  PostResult,
  PublisherStrategy,
} from '../interfaces/media-factory';
import { PlatformCapabilitiesService } from '../../common/platform-capabilities.service';
import { ConnectionService } from '../connection/connection.service';
import { ConnectionRepository } from '../../repositories/connection.repository';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PUBLISH_POST_QUEUE } from '../../common/queue.constant';

@Injectable()
export class PublisherService {
  constructor(
    @Inject('POST_STRATEGIES')
    private readonly strategies: PublisherStrategy[],
    private readonly platformCapabilitiesService: PlatformCapabilitiesService,
    private readonly connectionService: ConnectionService,
    private readonly connectionRepository: ConnectionRepository,
    @InjectQueue(PUBLISH_POST_QUEUE)
    private readonly publishQueue: Queue,
  ) {}

  async publish(params: CreatePostParams): Promise<PostResult> {
    const job = await this.publishQueue.add('publish-job', params, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    });

    return { id: job.id as string, error: null };
  }

  async executePublish(params: CreatePostParams): Promise<PostResult> {
    this.platformCapabilitiesService.checkCapability(params.platform, 'canPost');

    const strategy = this.strategies.find((s) => s.platform === params.platform);

    if (!strategy) {
      throw new Error(`Unsupported platform: ${params.platform}`);
    }

    if (!strategy.supportedMediaTypes.includes(params.type)) {
      throw new Error(`Platform ${params.platform} does not support media type: ${params.type}`);
    }

    const result = await strategy.createPost(params);

    // Task: If unauthorized, try refreshing token and retrying once
    if (result.error && this.isUnauthorizedError(result.error)) {
      try {
        console.warn(
          `Detected unauthorized error for ${params.platform}. Attempting token refresh and retry...`,
        );

        // We need the connection database ID.
        // Strategy.createPost uses connectionId (which is the original platform ID).
        // We need to find the DB ID to refresh it.
        const connection = await this.connectionRepository.findFirst({
          where: { original_id: (params as any).connectionId, platform: params.platform },
        });

        if (connection) {
          await this.connectionService.refreshToken(connection.id);
          // Retry the post with the new token (handled inside the strategy which re-fetches connection)
          return await strategy.createPost(params);
        }
      } catch (refreshError: any) {
        console.error(`Token refresh failed during retry for ${params.platform}:`, refreshError);
      }
    }

    return result;
  }

  private isUnauthorizedError(error: any): boolean {
    const message = error.message?.toLowerCase() || '';
    const responseStatus = error?.response?.status;

    return (
      responseStatus === 401 ||
      message.includes('unauthorized') ||
      message.includes('expired') ||
      message.includes('invalid token')
    );
  }

  async unpublish(params: DeletePostParams): Promise<PostResult> {
    this.platformCapabilitiesService.checkCapability(params.platform, 'canDelete');

    const strategy = this.strategies.find((s) => s.platform === params.platform);

    if (!strategy) {
      throw new Error(`Unsupported platform: ${params.platform}`);
    }

    return strategy.deletePost(params);
  }
}
