import { Module } from "@nestjs/common";
import { PrismaModule } from "nestjs-prisma";
import { PrismaOverrideModule } from "./prisma/prisma.module";

@Module({
  imports: [
    PrismaModule.forRoot({
      isGlobal: true,
    }),
    PrismaOverrideModule
  ],
})
export class AppModule {}
