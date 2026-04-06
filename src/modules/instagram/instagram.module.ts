import { Module } from '@nestjs/common';
import { InstagramGraphApiClient } from './instagram-graph.api';
import { InstagramAuthService } from './instagram.auth.service';
import { InstagramPostStrategy } from './instagram-post.strategy';

@Module({
  providers: [InstagramGraphApiClient, InstagramAuthService, InstagramPostStrategy],
  exports: [InstagramAuthService, InstagramGraphApiClient, InstagramPostStrategy],
})
export class InstagramModule {}
