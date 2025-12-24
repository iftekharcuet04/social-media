
import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaOverrideService } from "../prisma/prisma.service";
import { CursorPaginationInput, CursorPaginationResult } from "./ICursorInterface";

type Tx = Prisma.TransactionClient;

@Injectable()
export abstract class BaseRepository<
  T,
  CreateInput,
  UpdateInput,
  WhereUniqueInput,
  WhereInput,
  Select,
  Include = unknown
> {
  constructor(
    protected readonly prisma: PrismaOverrideService,
    private readonly modelAccessor: (p: PrismaOverrideService | Tx) => any
  ) {}

  protected model(tx?: Tx) {
    return this.modelAccessor(tx ?? this.prisma);
  }

  async create(params: {
    data: CreateInput;
    select?: Select;
    include?: Include;
    tx?: Tx;
  }): Promise<T> {
    const { data, select, include, tx } = params;
    return this.model(tx).create({ data, select, include });
  }

  async findUnique(params: {
    where: WhereUniqueInput;
    select?: Select;
    tx?: Tx;
  }): Promise<T | null> {
    const { where, select, tx } = params;
    return this.model(tx).findUnique({ where, select });
  }

  async findFirst(params: {
    where?: WhereInput;
    select?: Select;
    include?: Include;
    tx?: Tx;
  }): Promise<T | null> {
    const { where, select, include, tx } = params;
    return this.model(tx).findFirst({ where, select, include });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    orderBy?: any;
    where?: WhereInput;
    select?: Select;
    include?: Include;
    tx?: Tx;
  }): Promise<T[]> {
    const { skip, take, orderBy, where, select, include, tx } = params;

    return this.model(tx).findMany({
      where,
      select,
      include,
      skip,
      take,
      orderBy
    });
  }

  async findByCursor(params: {
    where?: WhereInput;
    orderBy: any;
    cursorField: keyof T;
    pagination: CursorPaginationInput<WhereUniqueInput>;
    select?: Select;
    include?: Include;
    tx?: Tx;
  }): Promise<CursorPaginationResult<T, WhereUniqueInput>> {
    const {
      where,
      orderBy,
      cursorField,
      pagination,
      select,
      include,
      tx
    } = params;
  
    const take = pagination.take ?? 10;
  
    const items = await this.model(tx).findMany({
      where,
      orderBy,
      take: take + 1, // fetch extra to detect next page
      skip: pagination.cursor ? 1 : undefined,
      cursor: pagination.cursor,
      select,
      include
    });
  
    const hasNextPage = items.length > take;
    const data = hasNextPage ? items.slice(0, take) : items;
  
    const nextCursor = hasNextPage
      ? { [cursorField]: (data[data.length - 1] as any)[cursorField] }
      : undefined;
  
    return {
      data,
      nextCursor
    };
  }
  

  async count(params: {
    where?: WhereInput;
    tx?: Tx;
  }): Promise<number> {
    const { where, tx } = params;
    return this.model(tx).count({ where });
  }

  async update(params: {
    where: WhereUniqueInput;
    data: UpdateInput;
    tx?: Tx;
  }): Promise<T> {
    const { where, data, tx } = params;
    return this.model(tx).update({ where, data });
  }

  async updateMany(params: {
    where: WhereInput;
    data: UpdateInput;
    tx?: Tx;
  }) {
    const { where, data, tx } = params;
    return this.model(tx).updateMany({ where, data });
  }

  async remove(params: {
    where: WhereUniqueInput;
    tx?: Tx;
  }): Promise<T> {
    const { where, tx } = params;
    return this.model(tx).delete({ where });
  }

  async removeMany(params: {
    where: WhereInput;
    tx?: Tx;
  }) {
    const { where, tx } = params;
    return this.model(tx).deleteMany({ where });
  }
}
