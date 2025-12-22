import {
  SocialAccountEntity,
  SocialPageEntity,
} from "../entities/social-account.entity";

export interface ISocialAccountRepository {
  findByProviderAndUserId(
    provider: string,
    providerUserId: string
  ): Promise<SocialAccountEntity | null>;
  create(account: SocialAccountEntity): Promise<SocialAccountEntity>;
  update(account: SocialAccountEntity): Promise<SocialAccountEntity>;
  addPages(
    accountId: string,
    pages: SocialPageEntity[]
  ): Promise<SocialPageEntity[]>;
  findPagesByAccountId(accountId: string): Promise<SocialPageEntity[]>;
}
