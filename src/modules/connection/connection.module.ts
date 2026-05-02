import { Module } from '@nestjs/common';
import { RepositoryModule } from '../../repositories/repository.module';
import { ConnectionController } from './connection.controller';
import { ConnectionService } from './connection.service';

import { TokenRefreshService } from './token-refresh.service';

@Module({
  imports: [RepositoryModule],
  controllers: [ConnectionController],
  providers: [ConnectionService, TokenRefreshService],
  exports: [ConnectionService],
})
export class ConnectionModule {}
