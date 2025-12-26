import { Module } from '@nestjs/common';
import { FacebookGraphClient } from './facebook-graph.client';
import { FacebookAuthService } from './facebook.auth.service';


@Module({
  providers: [FacebookGraphClient, FacebookAuthService],
  exports: [FacebookAuthService, FacebookGraphClient],
})
export class FacebookModule {}
