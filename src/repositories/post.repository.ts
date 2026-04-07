import { Injectable } from '@nestjs/common';
import { PrismaOverrideService } from '../prisma/prisma.service';
import { SocialPost, Prisma } from '@prisma/client';
import { BaseRepository } from './base-repository';

@Injectable()
export class PostRepository extends BaseRepository<
  SocialPost,
  Prisma.SocialPostCreateInput,
  Prisma.SocialPostUpdateInput,
  Prisma.SocialPostWhereUniqueInput,
  Prisma.SocialPostWhereInput,
  Prisma.SocialPostSelect
> {
  constructor(protected readonly prisma: PrismaOverrideService) {
    super(prisma, (db) => db.socialPost);
  }

  async markAsDeleted(postId: bigint): Promise<SocialPost> {
    return this.update({
      where: { id: postId },
      data: { status: 'DELETED' },
    });
  }
}
