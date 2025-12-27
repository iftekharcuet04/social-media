import { Module } from '@nestjs/common';
import { SocialMediaPostService } from './social-media-post.service';
import { SocialMediaController } from './social-media.controller';

@Module({
  imports: [],
  controllers: [SocialMediaController],
  providers: [SocialMediaPostService],
  exports: [],
})
export class SocialMediaPostModule {}
