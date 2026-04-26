import { Module, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "nestjs-prisma";
import { PrismaOverrideModule } from "./prisma/prisma.module";
import { RepositoryModule } from "./repositories/repository.module";
import { SocialMediaPostModule } from "./modules/social-media-post/social-media.module";
import { CommonModule } from "./common/common.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import appConfig from "./config/app.config";
import apiConfig from "./config/api.config";

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [appConfig, apiConfig],
      isGlobal: true,
      cache: true
    }),
    PrismaModule.forRoot({
      isGlobal: true,
    }),
    PrismaOverrideModule,
    RepositoryModule,
    SocialMediaPostModule,
    CommonModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  private readonly logger = new Logger(AppModule.name);

  onModuleInit() {
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl && !dbUrl.includes("connection_limit=")) {
      this.logger.warn(
        "ARCHITECTURAL ALERT: DATABASE_URL does not contain 'connection_limit'. " +
        "Please add '?connection_limit=20' to your connection string to prevent connection exhaustion."
      );
    }
  }
}
