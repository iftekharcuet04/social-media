import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PostRepository } from '../../../repositories/post.repository';
import { CreatePostParams } from '../../interfaces/media-factory';
import { PublisherService } from '../publisher.service';
import { PUBLISH_POST_QUEUE } from '../../../common/queue.constant';

@Processor(PUBLISH_POST_QUEUE)
@Injectable()
export class PublishProcessor extends WorkerHost {
  private readonly logger = new Logger(PublishProcessor.name);

  constructor(
    private readonly publisherService: PublisherService,
    private readonly postRepository: PostRepository,
  ) {
    super();
  }

  async process(job: Job<CreatePostParams & { dbPostId: bigint }>): Promise<any> {
    this.logger.log(`Processing job ${job.id} for platform ${job.data.platform}`);

    const result = await (this.publisherService as any).executePublish(job.data);

    if (result.error) {
      this.logger.error(`Job ${job.id} failed: ${result.error.message}`);
      throw result.error;
    }

    if (job.data.dbPostId) {
      await this.postRepository.update({
        where: { id: job.data.dbPostId },
        data: {
          status: 'PUBLISHED',
          original_post_id: result.id,
        },
      });
    }

    return result;
  }
}
