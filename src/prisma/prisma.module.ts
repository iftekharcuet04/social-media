import { Global, Module } from "@nestjs/common";
import { PrismaOverrideService } from "./prisma.service";

@Global()
@Module({
  providers: [PrismaOverrideService],
  exports: [PrismaOverrideService]
})
export class PrismaOverrideModule {}
