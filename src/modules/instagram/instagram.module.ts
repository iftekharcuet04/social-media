import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { RepositoryModule } from "../../repositories/repository.module";
import { InstagramGraphApiClient } from "./instagram-graph.api";
import { InstagramAuthService } from "./instagram.auth.service";
import { InstagramStrategy } from "./instagram.strategy";
import { IngestionModule } from "../ingestion/ingestion.module";
import { InstagramFeedService } from "./instagram-feed.service";

@Module({
  imports: [HttpModule, RepositoryModule, IngestionModule],
  providers: [InstagramGraphApiClient, InstagramAuthService, InstagramStrategy, InstagramFeedService],
  exports: [InstagramAuthService, InstagramGraphApiClient, InstagramStrategy, InstagramFeedService],
})
export class InstagramModule {}
