import { Module } from "@nestjs/common";
import { SocialController } from "./presentation/social.controller";

import { SocialAccountUseCase } from "./application/social-connect.usecase";
import { PrismaSocialAccountRepository } from "./domain/repositories/SocialAccountRepository";
import { SOCIAL_ACCOUNT_REPOSITORY } from "./domain/repositories/social-account.repository.token";
import { FacebookProvider } from "./infrastructure/facebook/facebook.provider";
import { PrismaModule } from "../prisma.module";

@Module({
  controllers: [SocialController],
  imports: [PrismaModule],
  providers: [
    SocialAccountUseCase,
    FacebookProvider,
    {
      provide: SOCIAL_ACCOUNT_REPOSITORY,
      useClass: PrismaSocialAccountRepository,
    },
  ],
  exports: [SocialAccountUseCase, FacebookProvider, SOCIAL_ACCOUNT_REPOSITORY],
})
export class SocialModule {}
