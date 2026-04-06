import { Module } from '@nestjs/common';
import { FacebookGraphClient } from './facebook-graph.client';
import { FacebookAuthService } from './facebook.auth.service';
import { FacebookPostStrategy } from './facebook-post.strategy';

@Module({
  providers: [FacebookGraphClient, FacebookAuthService, FacebookPostStrategy],
  exports: [FacebookAuthService, FacebookGraphClient, FacebookPostStrategy],
})
export class FacebookModule {}
