import { Module } from '@nestjs/common';
import { LinkedInStrategy } from './linkedin.strategy';

@Module({
  providers: [LinkedInStrategy],
  exports: [LinkedInStrategy],
})
export class LinkedInModule {}
