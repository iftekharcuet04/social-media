import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PlatformCapabilitiesService } from '../../common/platform-capabilities.service';
import { RepositoryModule } from '../../repositories/repository.module';
import { FacebookModule } from '../facebook/facebook.module';
import { InstagramModule } from '../instagram/instagram.module';
import { LinkedInModule } from '../linkedin/linkedin.module';
import { ConnectionModule } from '../connection/connection.module';
import { MediaService } from './media.service';
import { PublisherService } from './publisher.service';
import { PublishProcessor } from './queues/publish.processor';
import { SocialMediaPostService } from './social-media-post.service';
import { SocialMediaController } from './social-media.controller';

import { FacebookStrategy } from '../facebook/facebook.strategy';
import { InstagramStrategy } from '../instagram/instagram.strategy';
import { LinkedInStrategy } from '../linkedin/linkedin.strategy';
import { PUBLISH_POST_QUEUE } from '../../common/queue.constant';

@Module({
  imports: [
    RepositoryModule,
    ConnectionModule,
    FacebookModule,
    InstagramModule,
    LinkedInModule,
    BullModule.registerQueue({ name: PUBLISH_POST_QUEUE }),
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
  exports: [],
})
export class SocialMediaPostModule {}
