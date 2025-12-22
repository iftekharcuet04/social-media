import { Module } from "@nestjs/common";
import { SocialModule } from "./modules/connection/social.module";

@Module({
  imports: [SocialModule],
})
export class AppModule {}
