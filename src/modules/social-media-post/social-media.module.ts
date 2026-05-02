import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullModule } from '@nestjs/bullmq';
import { forwardRef, Module } from '@nestjs/common';
import { PlatformCapabilitiesService } from '../../common/platform-capabilities.service';
import { RepositoryModule } from '../../repositories/repository.module';
import { FacebookModule } from '../facebook/facebook.module';
import { FacebookStrategy } from '../facebook/facebook.strategy';
import { InstagramModule } from '../instagram/instagram.module';
import { InstagramStrategy } from '../instagram/instagram.strategy';
import { LinkedInModule } from '../linkedin/linkedin.module';
import { LinkedInStrategy } from '../linkedin/linkedin.strategy';
import { MediaService } from './media.service';
import { PublisherService } from './publisher.service';
import { PublishProcessor } from './queues/publish.processor';
import { SocialMediaPostService } from './social-media-post.service';
import { SocialMediaController } from './social-media.controller';

import { PUBLISH_POST_QUEUE } from '../../common/queue.constant';
import { ConnectionModule } from '../connection/connection.module';

@Module({
  imports: [
    RepositoryModule,
    ConnectionModule,
    forwardRef(() => FacebookModule),
    forwardRef(() => InstagramModule),
    forwardRef(() => LinkedInModule),
    BullModule.registerQueue({
      name: PUBLISH_POST_QUEUE,
    }),
    BullBoardModule.forFeature({
      name: PUBLISH_POST_QUEUE,
      adapter: BullMQAdapter,
    }),
  ],
  controllers: [SocialMediaController],
  providers: [
    SocialMediaPostService,
    PublisherService,
    MediaService,
    PlatformCapabilitiesService,
    PublishProcessor,
    {
      provide: 'POST_STRATEGIES',
      useFactory: (
        facebookStrategy: FacebookStrategy,
        instagramStrategy: InstagramStrategy,
        linkedInStrategy: LinkedInStrategy,
      ) => [facebookStrategy, instagramStrategy, linkedInStrategy],
      inject: [FacebookStrategy, InstagramStrategy, LinkedInStrategy],
    },
  ],
  exports: [ConnectionModule],
})
export class SocialMediaPostModule {}
