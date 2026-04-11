import { Module } from '@nestjs/common';
import { InstagramGraphApiClient } from './instagram-graph.api';
import { InstagramAuthService } from './instagram.auth.service';
import { InstagramStrategy } from './instagram.strategy';
import { HttpModule } from '@nestjs/axios';
import { ConnectionRepository } from '../../repositories/connection.repository';

@Module({
  providers: [InstagramGraphApiClient, InstagramAuthService, InstagramStrategy, ConnectionRepository],
  imports: [HttpModule],
  exports: [InstagramAuthService, InstagramGraphApiClient, InstagramStrategy, HttpModule, ConnectionRepository],
})
export class InstagramModule { }
