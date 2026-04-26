import { Module } from '@nestjs/common';
import { FacebookGraphClient } from './facebook-graph.client';
import { FacebookAuthService } from './facebook.auth.service';
import { FacebookPostStrategy } from './facebook-post.strategy';
import { HttpModule } from '@nestjs/axios';
import { RepositoryModule } from '../../repositories/repository.module';

@Module({
  imports: [HttpModule, RepositoryModule],
  providers: [FacebookGraphClient, FacebookAuthService, FacebookPostStrategy],
  exports: [FacebookAuthService, FacebookGraphClient, FacebookPostStrategy],
})
export class FacebookModule {}
