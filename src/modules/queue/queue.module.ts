import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { PUBLISH_POST_QUEUE } from '../../common/queue.constant';

@Global()
@Module({
  imports: [
    BullModule.registerQueue({
      name: PUBLISH_POST_QUEUE,
    }),
    BullBoardModule.forFeature({
      name: PUBLISH_POST_QUEUE,
      adapter: BullMQAdapter,
    }),
  ],
  exports: [BullModule],
})
export class QueueModule {}
