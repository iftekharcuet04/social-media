import { Injectable } from '@nestjs/common';
import { PrismaOverrideService } from '../prisma/prisma.service';
import { Connection, Prisma } from '@prisma/client';
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
}
