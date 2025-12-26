import { Module } from "@nestjs/common";
import { InstagramGraphApi } from "./instagram-graph.api";
import { InstagramAuthService } from "./instagram.auth.service";

@Module({
  providers: [InstagramGraphApi, InstagramAuthService],
  exports: [InstagramAuthService, InstagramGraphApi],
})
export class FacebookModule {}
