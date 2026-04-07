import { Inject, Injectable } from '@nestjs/common';
import { CreatePostParams, DeletePostParams, PostResult, SocialPostStrategy } from '../interfaces/media-factory';
import { PlatformCapabilitiesService } from '../../common/platform-capabilities.service';

@Injectable()
export class PublisherService {
  constructor(
    @Inject('POST_STRATEGIES')
    private readonly strategies: SocialPostStrategy[],
    private readonly platformCapabilitiesService: PlatformCapabilitiesService,
  ) {}

  async publish(params: CreatePostParams): Promise<PostResult> {
    this.platformCapabilitiesService.checkCapability(params.platform, 'canPost');

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

  async unpublish(params: DeletePostParams): Promise<PostResult> {
    this.platformCapabilitiesService.checkCapability(params.platform, 'canDelete');

    const strategy = this.strategies.find(
      (s) => s.platform === params.platform,
    );

    if (!strategy) {
      throw new Error(`Unsupported platform: ${params.platform}`);
    }

    return strategy.deletePost(params);
  }
}
