import { Injectable } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { ISocialAccountRepository } from "../../domain/repositories/social-account.repository.interface";
import { SocialAccountEntity, SocialPageEntity } from "../../domain/entities/social-account.entity";

@Injectable()
export class PrismaSocialAccountRepository implements ISocialAccountRepository {
  constructor(private prisma: PrismaClient) {}

  async findByProviderAndUserId(provider: string, providerUserId: string): Promise<SocialAccountEntity | null> {
    const account = await this.prisma.socialAccount.findUnique({
      where: { provider_providerUserId: { provider, providerUserId } },
      include: { pages: true }
    });
    if (!account) return null;

    return {
      id: account.id,
      provider: account.provider,
      providerUserId: account.providerUserId,
      email: account.email ?? undefined,
      pages: account.pages.map((p: SocialPageEntity) => ({
        id: p.id,
        pageId: p.pageId,
        name: p.name,
        accessToken: p.accessToken
      }))
    };
  }

  async create(account: SocialAccountEntity): Promise<SocialAccountEntity> {
    const created = await this.prisma.socialAccount.create({
      data: {
        provider: account.provider,
        providerUserId: account.providerUserId,
        email: account.email,
        pages: {
          create: account.pages?.map((p:SocialPageEntity) => ({
            pageId: p.pageId,
            name: p.name,
            accessToken: p.accessToken
          })) ?? []
        }
      },
      include: { pages: true }
    });

    return {
      id: created.id,
      provider: created.provider,
      providerUserId: created.providerUserId,
      email: created.email ?? undefined,
      pages: created.pages.map((p: SocialPageEntity) => ({
        id: p.id,
        pageId: p.pageId,
        name: p.name,
        accessToken: p.accessToken
      }))
    };
  }

  async update(account: SocialAccountEntity): Promise<SocialAccountEntity> {
    if (!account.id) throw new Error("Account ID is required for update");
  
    const updated = await this.prisma.socialAccount.update({
      where: { id: account.id },
      data: {
        email: account.email,
          pages: {
          create: account.pages?.map((p: SocialPageEntity) => ({
            pageId: p.pageId,
            name: p.name,
            accessToken: p.accessToken
          })) ?? []
        }
      },
      include: { pages: true }
    });
  
    return {
      id: updated.id,
      provider: updated.provider,
      providerUserId: updated.providerUserId,
      email: updated.email ?? undefined,
      pages: updated.pages.map(p => ({
        id: p.id,
        pageId: p.pageId,
        name: p.name,
        accessToken: p.accessToken
      }))
    };
  }
  

  async addPages(accountId: string, pages: SocialPageEntity[]): Promise<SocialPageEntity[]> {
    const created = await this.prisma.socialPage.createMany({
      data: pages.map((p: SocialPageEntity) => ({
        socialAccountId: accountId,
        pageId: p.pageId,
        name: p.name,
        accessToken: p.accessToken
      })),
      skipDuplicates: true
    });

    return this.findPagesByAccountId(accountId);
  }

  async findPagesByAccountId(accountId: string): Promise<SocialPageEntity[]> {
    const pages = await this.prisma.socialPage.findMany({ where: { socialAccountId: accountId } });
    return pages.map((p: SocialPageEntity) => ({
      id: p.id,
      pageId: p.pageId,
      name: p.name,
      accessToken: p.accessToken
    }));
  }
}
