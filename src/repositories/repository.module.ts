import { Module } from "@nestjs/common";
import { ConnectionRepository } from "./connection.repository";
import { PostRepository } from "./post.repository";

@Module({
  exports: [ConnectionRepository, PostRepository],
  providers: [ConnectionRepository, PostRepository],
})
export class RepositoryModule {}
