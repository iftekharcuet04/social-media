import { Module } from '@nestjs/common';
import { FacebookGraphClient } from './facebook-graph.client';
import { FacebookAuthService } from './facebook.auth.service';

import { HttpModule } from '@nestjs/axios';
import { RepositoryModule } from '../../repositories/repository.module';
import { FacebookFeedService } from './facebook-feed.service';
import { FacebookStrategy } from './facebook.strategy';

@Module({
  imports: [HttpModule, RepositoryModule],
  providers: [FacebookGraphClient, FacebookAuthService, FacebookStrategy, FacebookFeedService],
  exports: [FacebookAuthService, FacebookGraphClient, FacebookStrategy, FacebookFeedService],
})
export class FacebookModule {}
