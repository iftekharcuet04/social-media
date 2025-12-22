import { Inject, Injectable } from "@nestjs/common";
import { ISocialAccountRepository } from "../domain/repositories/social-account.repository.interface";
import { SocialAccountEntity, SocialPageEntity } from "../domain/entities/social-account.entity";
import { SOCIAL_ACCOUNT_REPOSITORY } from "../domain/repositories/social-account.repository.token";


@Injectable()
export class SocialAccountUseCase {
  constructor(@Inject(SOCIAL_ACCOUNT_REPOSITORY)
  private readonly repository: ISocialAccountRepository) {}

  async connectAccount(account: SocialAccountEntity): Promise<SocialAccountEntity> {
    const existing = await this.repository.findByProviderAndUserId(account.provider, account.providerUserId);
    if (existing) {
      return this.repository.update({ ...existing, ...account });
    } else {
      return this.repository.create(account);
    }
  }

  async addPages(accountId: string, pages: SocialPageEntity[]): Promise<SocialPageEntity[]> {
    return this.repository.addPages(accountId, pages);
  }

  async getPages(accountId: string): Promise<SocialPageEntity[]> {
    return this.repository.findPagesByAccountId(accountId);
  }

  async getAccount(provider: string, providerUserId: string): Promise<SocialAccountEntity | null> {
    return this.repository.findByProviderAndUserId(provider, providerUserId);
  }
}
