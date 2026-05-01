import { Injectable } from '@nestjs/common';
import { ConnectionPlatform, PlatformSetting, Prisma } from '@prisma/client';
import { BaseRepository } from './base-repository';
import { PrismaOverrideService } from '../prisma/prisma.service';

@Injectable()
export class PlatformSettingRepository extends BaseRepository<
  PlatformSetting,
  Prisma.PlatformSettingCreateInput,
  Prisma.PlatformSettingUpdateInput,
  Prisma.PlatformSettingWhereUniqueInput,
  Prisma.PlatformSettingWhereInput,
  Prisma.PlatformSettingSelect
> {
  constructor(prisma: PrismaOverrideService) {
    super(prisma, (p) => p.platformSetting);
  }

  async getByPlatform(platform: ConnectionPlatform): Promise<PlatformSetting | null> {
    return this.findUnique({
      where: { platform },
    });
  }
}
