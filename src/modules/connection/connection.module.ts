import { forwardRef, Module } from '@nestjs/common';
import { ConnectionService } from './connection.service';
import { ConnectionController } from './connection.controller';
import { RepositoryModule } from '../../repositories/repository.module';
import { FacebookModule } from '../facebook/facebook.module';
import { InstagramModule } from '../instagram/instagram.module';
import { FacebookAuthService } from '../facebook/facebook.auth.service';
import { InstagramAuthService } from '../instagram/instagram.auth.service';

import { TokenRefreshService } from './token-refresh.service';

@Module({
  imports: [RepositoryModule, forwardRef(() => FacebookModule), forwardRef(() => InstagramModule)],
  controllers: [ConnectionController],
  providers: [
    ConnectionService,
    TokenRefreshService,
    {
      provide: 'AUTH_STRATEGIES',
      useFactory: (
        facebookAuthService: FacebookAuthService,
        instagramAuthService: InstagramAuthService,
      ) => [facebookAuthService, instagramAuthService],
      inject: [FacebookAuthService, InstagramAuthService],
    },
  ],
  exports: [ConnectionService],
})
export class ConnectionModule {}
