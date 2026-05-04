import { Module } from '@nestjs/common';
import { RepositoryModule } from '../../repositories/repository.module';
import { ConnectionController } from './connection.controller';
import { ConnectionService } from './connection.service';
import { TokenRefreshService } from './token-refresh.service';
import { FacebookModule } from '../facebook/facebook.module';
import { InstagramModule } from '../instagram/instagram.module';
import { FacebookAuthService } from '../facebook/facebook.auth.service';
import { InstagramAuthService } from '../instagram/instagram.auth.service';
import { AUTH_STRATEGIES } from '../interfaces/auth-strategy';
import { TOKEN_REFRESHER } from '../interfaces/token-refresher.interface';

@Module({
  imports: [RepositoryModule, FacebookModule, InstagramModule],
  controllers: [ConnectionController],
  providers: [
    ConnectionService,
    TokenRefreshService,
    {
      provide: AUTH_STRATEGIES,
      useFactory: (fb: FacebookAuthService, ig: InstagramAuthService) => [fb, ig],
      inject: [FacebookAuthService, InstagramAuthService],
    },
    {
      provide: TOKEN_REFRESHER,
      useExisting: ConnectionService,
    },
  ],
  exports: [ConnectionService, TOKEN_REFRESHER],
})
export class ConnectionModule {}
