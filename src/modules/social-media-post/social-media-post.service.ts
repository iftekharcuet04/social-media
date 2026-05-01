import { Injectable } from '@nestjs/common';
import { CreatePostParams, DeletePostParams, PostResult } from '../interfaces/media-factory';
import { PublisherService } from './publisher.service';
import { MediaService } from './media.service';
import { PostRepository } from '../../repositories/post.repository';

@Injectable()
export class SocialMediaPostService {
  constructor(
    private readonly publisherService: PublisherService,
    private readonly mediaService: MediaService,
    private readonly postRepository: PostRepository,
  ) {}

  async createPost(params: CreatePostParams): Promise<PostResult> {
    // 1. Process related media assets first (Separating media handling)
    if (params.urls && params.urls.length > 0) {
      params.urls = await this.mediaService.handleMedia(params.urls);
    }

    // 2. Perform core database operations for storing posts
    const dbPost = await this.postRepository.create({
      data: {
        user: { connect: { uid: params.userId } },
        connection_id: params.connectionId,
        platform: params.platform as any,
        message: params.message,
        urls: params.urls || [],
        status: 'PUBLISHED',
      },
    });

    // 3. Delegate to Publisher for the actual social media posting flow
    const result = await this.publisherService.publish(params);

    if (result.error) {
      await this.postRepository.update({
        where: { id: dbPost.id },
        data: { status: 'FAILED' },
      });
    }

    return result;
  }

  async deletePost(params: DeletePostParams): Promise<PostResult> {
    // 1. Delegate to Publisher for the actual social media un-posting flow first
    const result = await this.publisherService.unpublish(params);

    // 2. Perform core database operations for deleting/archiving posts locally
    if (!result.error && params.postId) {
      await this.postRepository.markAsDeleted(params.userId, BigInt(params.postId));
    }

    return result;
  }
}
