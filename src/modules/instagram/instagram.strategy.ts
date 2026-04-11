import { Injectable } from '@nestjs/common';
import {
  INSTAGRAM_GRAPH_BASE_URL,
  INSTAGRAM_VERSION,
} from '../../common/api.constant';
import { withRetry } from '../../common/retry.util';
import { ConnectionRepository } from '../../repositories/connection.repository';
import {
  CreatePostParams,
  DeletePostParams,
  InstagramPostParams,
  PostResult,
  PublisherStrategy,
} from '../interfaces/media-factory';
import { InstagramGraphApiClient } from './instagram-graph.api';

@Injectable()
export class InstagramStrategy implements PublisherStrategy {
  readonly platform = 'INSTAGRAM' as const;
  readonly supportedMediaTypes = ['IMAGE', 'VIDEO'] as const;

  constructor(
    private readonly instagramGraphClient: InstagramGraphApiClient,
    private readonly connectionRepository: ConnectionRepository,
  ) {}

  async createPost(params: CreatePostParams): Promise<PostResult> {
    const igParams = params as InstagramPostParams;

    try {
      const connection = await this.connectionRepository.findByPlatformAndOriginalId(
        'INSTAGRAM',
        igParams.connectionId,
      );

      if (!connection) {
        throw new Error('Connection not found');
      }

      const apiUrl = `${INSTAGRAM_GRAPH_BASE_URL}/${INSTAGRAM_VERSION}/${connection.original_id}`;
      const url = igParams.urls?.[0];

      const containerId = igParams.type === 'IMAGE'
        ? await this.createImageContainer(apiUrl, connection.access_token, igParams.message, url)
        : await this.createVideoContainer(apiUrl, connection.access_token, igParams.message, url, igParams.mediaType);

      if (!containerId) {
        return { id: null, error: new Error('Failed to create media container') };
      }

      const publishedId = await this.publishWithRetry(apiUrl, containerId, connection.access_token);
      const mediaInfo = await this.instagramGraphClient.getMediaDetails(
        apiUrl,
        publishedId,
        connection.access_token,
      );

      return { id: mediaInfo, error: null };
    } catch (error) {
      return { id: null, error };
    }
  }

  private async createImageContainer(
    apiUrl: string,
    accessToken: string,
    caption: string,
    url?: string,
  ): Promise<string | null> {
    const response = await this.instagramGraphClient.createImageMediaContainer({
      apiUrl,
      accessToken,
      caption,
      url,
    });
    return response?.data?.id ?? null;
  }

  private async createVideoContainer(
    apiUrl: string,
    accessToken: string,
    caption: string,
    url?: string,
    mediaType?: string,
  ): Promise<string | null> {
    const resolvedMediaType = mediaType ?? 'reels';
    const response = await this.instagramGraphClient.createVideoMediaContainer({
      apiUrl,
      accessToken,
      caption,
      mediaType: resolvedMediaType,
      url,
    });
    return response?.data?.id ?? null;
  }

  private async publishWithRetry(
    apiUrl: string,
    creationId: string,
    accessToken: string,
  ): Promise<string> {
    const result = await withRetry(
      async () => {
        const response = await this.instagramGraphClient.publishMedia(
          apiUrl,
          creationId,
          accessToken,
        );
        const id = response?.data?.id;
        if (!id) {
          throw new Error('Invalid publish response');
        }
        return id;
      },
      { retries: 3, delayMs: 3000, label: 'Instagram publish' },
    );

    return result;
  }

  async deletePost(params: DeletePostParams): Promise<PostResult> {
    return {
      id: null,
      error: new Error('Delete capability is not supported for platform: INSTAGRAM'),
    };
  }
}
