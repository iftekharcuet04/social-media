import { Module } from '@nestjs/common';
import { ConnectionRepository } from './connection.repository';
import { PostRepository } from './post.repository';
import { UserRepository } from './user.repository';
import { PlatformSettingRepository } from './platform-setting.repository';

@Module({
  exports: [ConnectionRepository, PostRepository, UserRepository, PlatformSettingRepository],
  providers: [ConnectionRepository, PostRepository, UserRepository, PlatformSettingRepository],
})
export class RepositoryModule {}
