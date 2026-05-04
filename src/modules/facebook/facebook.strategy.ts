import { Injectable } from '@nestjs/common';
import { ConnectionRepository } from '../../repositories/connection.repository';
import {
  CreatePostParams,
  DeletePostParams,
  FacebookPostParams,
  PostResult,
  PublisherStrategy,
} from '../interfaces/media-factory';
import { FacebookGraphClient } from './facebook-graph.client';
import { withRetry } from '../../common/retry.util';

@Injectable()
export class FacebookStrategy implements PublisherStrategy {
  readonly platform = 'FACEBOOK' as const;
  readonly supportedMediaTypes = ['TEXT', 'IMAGE', 'VIDEO'] as const;

  constructor(
    private readonly facebookGraphClient: FacebookGraphClient,
    private readonly connectionRepository: ConnectionRepository,
  ) {}

  async createPost(params: CreatePostParams): Promise<PostResult> {
    const fbParams = params as FacebookPostParams;

    try {
      const connection = await this.connectionRepository.findByPlatformAndOriginalId(
        fbParams.userId,
        'FACEBOOK',
        fbParams.connectionId,
      );

      if (!connection) {
        throw new Error('Connection not found');
      }

      const { type, message } = fbParams;
      const url = fbParams.urls?.[0];

      if (type === 'IMAGE') {
        const response = await withRetry(
          () =>
            this.facebookGraphClient.uploadImage(
              connection.original_id,
              connection.access_token,
              message,
              url,
            ),
          { retries: 3, delayMs: 3000, label: 'Facebook Image Upload' },
        );
        return { id: response.id, error: null };
      }

      if (type === 'VIDEO') {
        const response = await withRetry(
          () =>
            this.facebookGraphClient.uploadVideo(
              connection.original_id,
              connection.access_token,
              message,
              url,
            ),
          { retries: 3, delayMs: 3000, label: 'Facebook Video Upload' },
        );
        return { id: response.id, error: null };
      }

      // TEXT post
      const response = await withRetry(
        () =>
          this.facebookGraphClient.uploadText(
            connection.original_id,
            connection.access_token,
            message,
          ),
        { retries: 3, delayMs: 3000, label: 'Facebook Text Upload' },
      );
      return { id: response.id, error: null };
    } catch (error: any) {
      return { id: null, error };
    }
  }

  async deletePost(params: DeletePostParams): Promise<PostResult> {
    try {
      const connection = await this.connectionRepository.findByPlatformAndOriginalId(
        params.userId,
        'FACEBOOK',
        params.connectionId,
      );

      if (!connection) {
        throw new Error('Connection not found');
      }

      await this.facebookGraphClient.deletePost(params.postId, connection.access_token);

      return { id: params.postId, error: null };
    } catch (error: any) {
      return { id: null, error };
    }
  }
}
