import { Module } from '@nestjs/common';
import { InstagramGraphApiClient } from './instagram-graph.api';
import { InstagramAuthService } from './instagram.auth.service';
import { InstagramPostStrategy } from './instagram-post.strategy';
import { HttpModule } from '@nestjs/axios';
import { RepositoryModule } from '../../repositories/repository.module';

@Module({
  imports: [HttpModule, RepositoryModule],
  providers: [InstagramGraphApiClient, InstagramAuthService, InstagramPostStrategy],
  exports: [InstagramAuthService, InstagramGraphApiClient, InstagramPostStrategy],
})
export class InstagramModule {}
