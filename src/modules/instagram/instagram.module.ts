import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { RepositoryModule } from "../../repositories/repository.module";
import { InstagramGraphApiClient } from "./instagram-graph.api";
import { InstagramAuthService } from "./instagram.auth.service";
import { InstagramStrategy } from "./instagram.strategy";

@Module({
  imports: [HttpModule, RepositoryModule],
  providers: [InstagramGraphApiClient, InstagramAuthService, InstagramStrategy],
  exports: [InstagramAuthService, InstagramGraphApiClient, InstagramStrategy],
})
export class InstagramModule {}
