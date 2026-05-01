import { Injectable } from '@nestjs/common';
import { PrismaOverrideService } from '../prisma/prisma.service';
import { User, Prisma } from '@prisma/client';
import { BaseRepository } from './base-repository';

@Injectable()
export class UserRepository extends BaseRepository<
  User,
  Prisma.UserCreateInput,
  Prisma.UserUpdateInput,
  Prisma.UserWhereUniqueInput,
  Prisma.UserWhereInput,
  Prisma.UserSelect
> {
  constructor(protected readonly prisma: PrismaOverrideService) {
    super(prisma, (db) => db.user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findFirst({
      where: { email },
    });
  }
}
