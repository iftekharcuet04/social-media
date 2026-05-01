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

  async markAsDeleted(userId: string, postId: bigint): Promise<void> {
    await this.updateMany({
      where: { id: postId, user_id: userId },
      data: { status: 'DELETED' },
    });
  }
}
