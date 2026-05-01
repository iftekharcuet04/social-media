import { Injectable } from '@nestjs/common';
import {
  CreatePostParams,
  DeletePostParams,
  PostResult,
  PublisherStrategy,
} from '../interfaces/media-factory';

@Injectable()
export class LinkedInStrategy implements PublisherStrategy {
  readonly platform = 'LINKEDIN' as const;
  readonly supportedMediaTypes = ['TEXT', 'IMAGE', 'VIDEO'] as const;

  async createPost(_params: CreatePostParams): Promise<PostResult> {
    // Stub implementation for LinkedIn to keep external API unchanged
    // Actual implementation would interact with a LinkedIn Graph API client
    return { id: `mock-linkedin-id-${Date.now()}`, error: null };
  }

  async deletePost(params: DeletePostParams): Promise<PostResult> {
    // Stub implementation
    return { id: params.postId, error: null };
  }
}
