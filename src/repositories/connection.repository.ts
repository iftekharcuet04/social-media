import { Injectable } from '@nestjs/common';
import { PrismaOverrideService } from '../prisma/prisma.service';
import { Connection, ConnectionPlatform, Prisma } from '@prisma/client';
import { BaseRepository } from './base-repository';

@Injectable()
export class ConnectionRepository extends BaseRepository<
  Connection,
  Prisma.ConnectionCreateInput,
  Prisma.ConnectionUpdateInput,
  Prisma.ConnectionWhereUniqueInput,
  Prisma.ConnectionWhereInput,
  Prisma.ConnectionSelect
> {
  constructor(protected readonly prisma: PrismaOverrideService) {
    super(prisma, (db) => db.connection);
  }

  async findByPlatformAndOriginalId(
    userId: string,
    platform: ConnectionPlatform,
    originalId: string,
  ): Promise<{ original_id: string; access_token: string } | null> {
    return this.findFirst({
      where: { user_id: userId, platform, original_id: originalId },
      select: { original_id: true, access_token: true },
    });
  }
}
