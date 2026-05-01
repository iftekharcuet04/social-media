import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PublisherService } from '../publisher.service';
import { CreatePostParams } from '../../interfaces/media-factory';
import { Logger } from '@nestjs/common';
import { PostRepository } from '../../../repositories/post.repository';
import { PUBLISH_POST_QUEUE } from '../../../common/queue.constant';

@Processor(PUBLISH_POST_QUEUE)
export class PublishProcessor extends WorkerHost {
  private readonly logger = new Logger(PublishProcessor.name);

  constructor(
    private readonly publisherService: PublisherService,
    private readonly postRepository: PostRepository,
  ) {
    super();
  }

  async process(job: Job<CreatePostParams & { dbPostId: bigint }, any, string>): Promise<any> {
    this.logger.log(`Processing publish job ${job.id} for platform ${job.data.platform}`);

    const result = await (this.publisherService as any).executePublish(job.data);

    if (result.error) {
      this.logger.error(`Publish job ${job.id} failed: ${result.error.message}`);
      // Throwing will trigger BullMQ backoff/retry
      throw result.error;
    }

    // Task: Update DB status to PUBLISHED on success
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
