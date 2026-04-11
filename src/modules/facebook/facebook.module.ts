import { Module } from '@nestjs/common';
import { FacebookGraphClient } from './facebook-graph.client';
import { FacebookAuthService } from './facebook.auth.service';
import { FacebookStrategy } from './facebook.strategy';
import { HttpModule, HttpService } from '@nestjs/axios';
import { ConnectionRepository } from '../../repositories/connection.repository';

@Module({
  providers: [FacebookGraphClient, FacebookAuthService, FacebookStrategy, ConnectionRepository],
  imports: [HttpModule],
  exports: [FacebookAuthService, FacebookGraphClient, FacebookStrategy, HttpModule, ConnectionRepository],
})
export class FacebookModule { }
