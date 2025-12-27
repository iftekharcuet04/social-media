import { Module } from "@nestjs/common";
import { ConnectionRepository } from "./connection.repository";

@Module({
  exports: [ConnectionRepository],
  providers: [ConnectionRepository],
})
export class RepositoryModule {}
