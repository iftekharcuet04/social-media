import { Module } from "@nestjs/common";
import { FacebookGraphClient } from "./facebook-graph.client";
import { FacebookAuthService } from "./facebook.auth.service";

import { HttpModule } from "@nestjs/axios";
import { RepositoryModule } from "../../repositories/repository.module";
import { FacebookStrategy } from "./facebook.strategy";

@Module({
  imports: [HttpModule, RepositoryModule],
  providers: [FacebookGraphClient, FacebookAuthService, FacebookStrategy],
  exports: [FacebookAuthService, FacebookGraphClient, FacebookStrategy],
})
export class FacebookModule {}
