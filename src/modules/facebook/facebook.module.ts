import { Module } from "@nestjs/common";
import { FacebookGraphClient } from "./facebook-graph.client";
import { FacebookAuthService } from "./facebook.auth.service";

import { HttpModule } from "@nestjs/axios";
import { RepositoryModule } from "../../repositories/repository.module";
import { FacebookStrategy } from "./facebook.strategy";
import { IngestionModule } from "../ingestion/ingestion.module";
import { FacebookFeedService } from "./facebook-feed.service";

@Module({
  imports: [HttpModule, RepositoryModule, IngestionModule],
  providers: [FacebookGraphClient, FacebookAuthService, FacebookStrategy, FacebookFeedService],
  exports: [FacebookAuthService, FacebookGraphClient, FacebookStrategy, FacebookFeedService],
})
export class FacebookModule {}
