import { Inject, Injectable } from '@nestjs/common';
import {
  CreatePostParams,
  DeletePostParams,
  PostResult,
  SocialPostStrategy,
} from '../interfaces/media-factory';

@Injectable()
export class SocialMediaPostService {
  constructor(
    @Inject('POST_STRATEGIES')
    private readonly strategies: SocialPostStrategy[],
  ) {}

  async createPost(params: CreatePostParams): Promise<PostResult> {
    const strategy = this.strategies.find(
      (s) => s.platform === params.platform,
    );

    if (!strategy) {
      throw new Error(`Unsupported platform: ${params.platform}`);
    }

    if (!strategy.supportedMediaTypes.includes(params.type)) {
      throw new Error(
        `Platform ${params.platform} does not support media type: ${params.type}`,
      );
    }

    return strategy.createPost(params);
  }

  async deletePost(params: DeletePostParams): Promise<PostResult> {
    const strategy = this.strategies.find(
      (s) => s.platform === params.platform,
    );

    if (!strategy) {
      throw new Error(`Unsupported platform: ${params.platform}`);
    }

    return strategy.deletePost(params);
  }
}
