import { Injectable } from '@nestjs/common';
import { ConnectionRepository } from '../../repositories/connection.repository';
import {
  CreatePostParams,
  DeletePostParams,
  FacebookPostParams,
  PostResult,
  SocialPostStrategy,
} from '../interfaces/media-factory';
import { FacebookGraphClient } from './facebook-graph.client';

@Injectable()
export class FacebookPostStrategy implements SocialPostStrategy {
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
        'FACEBOOK',
        fbParams.connectionId,
      );

      if (!connection) {
        throw new Error('Connection not found');
      }

      const { type, message } = fbParams;
      const url = fbParams.urls?.[0];

      if (type === 'IMAGE') {
        const response = await this.facebookGraphClient.uploadImage(
          connection.original_id,
          connection.access_token,
          message,
          url,
        );
        return { id: response.id, error: null };
      }

      if (type === 'VIDEO') {
        const response = await this.facebookGraphClient.uploadVideo(
          connection.original_id,
          connection.access_token,
          message,
          url,
        );
        return { id: response.id, error: null };
      }

      // TEXT post
      const response = await this.facebookGraphClient.uploadText(
        connection.original_id,
        connection.access_token,
        message,
      );
      return { id: response.id, error: null };
    } catch (error) {
      return { id: null, error };
    }
  }

  async deletePost(params: DeletePostParams): Promise<PostResult> {
    try {
      const connection = await this.connectionRepository.findByPlatformAndOriginalId(
        'FACEBOOK',
        params.connectionId,
      );

      if (!connection) {
        throw new Error('Connection not found');
      }

      await this.facebookGraphClient.deletePost(
        params.postId,
        connection.access_token,
      );

      return { id: params.postId, error: null };
    } catch (error) {
      return { id: null, error };
    }
  }
}
