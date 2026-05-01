import { Module } from '@nestjs/common';
import { CommonModule } from '../../common/common.module';
import { RepositoryModule } from '../../repositories/repository.module';
import { FeedIngestionService } from './feed-ingestion.service';

@Module({
  imports: [CommonModule, RepositoryModule],
  providers: [FeedIngestionService],
  exports: [FeedIngestionService],
})
export class IngestionModule {}
