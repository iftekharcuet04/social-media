import { Module } from "@nestjs/common";
import { SocialModule } from "./modules/social/social.module";

@Module({
  imports: [SocialModule],
})
export class AppModule {}
