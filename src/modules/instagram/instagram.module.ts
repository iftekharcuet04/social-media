import { Module } from "@nestjs/common";
import { InstagramGraphApiClient } from "./instagram-graph.api";
import { InstagramAuthService } from "./instagram.auth.service";

@Module({
  providers: [InstagramGraphApiClient, InstagramAuthService],
  exports: [InstagramAuthService, InstagramGraphApiClient],
})
export class FacebookModule {}
