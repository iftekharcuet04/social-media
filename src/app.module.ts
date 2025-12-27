import { Module } from "@nestjs/common";
import { PrismaModule } from "nestjs-prisma";
import { PrismaOverrideModule } from "./prisma/prisma.module";
import { RepositoryModule } from "./repositories/repository.module";
import { SocialMediaPostModule } from "./modules/social-media-post/social-media.module";

@Module({
  imports: [
    PrismaModule.forRoot({
      isGlobal: true,
    }),
    PrismaOverrideModule,
    RepositoryModule,
    SocialMediaPostModule
  ],
})
export class AppModule {}
