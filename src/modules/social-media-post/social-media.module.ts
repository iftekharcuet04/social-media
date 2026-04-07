import { Module } from '@nestjs/common';
import { SocialMediaPostService } from './social-media-post.service';
import { PublisherService } from './publisher.service';
import { MediaService } from './media.service';
import { PlatformCapabilitiesService } from '../../common/platform-capabilities.service';
import { SocialMediaController } from './social-media.controller';
import { RepositoryModule } from '../../repositories/repository.module';
import { FacebookModule } from '../facebook/facebook.module';
import { InstagramModule } from '../instagram/instagram.module';
import { FacebookPostStrategy } from '../facebook/facebook-post.strategy';
import { InstagramPostStrategy } from '../instagram/instagram-post.strategy';

@Module({
  imports: [RepositoryModule, FacebookModule, InstagramModule],
  controllers: [SocialMediaController],
  providers: [
    SocialMediaPostService,
    PublisherService,
    MediaService,
    PlatformCapabilitiesService,
    {
      provide: 'POST_STRATEGIES',
      useFactory: (
        facebookStrategy: FacebookPostStrategy,
        instagramStrategy: InstagramPostStrategy,
      ) => [facebookStrategy, instagramStrategy],
      inject: [FacebookPostStrategy, InstagramPostStrategy],
    },
  ],
  exports: [],
})
export class SocialMediaPostModule {}
