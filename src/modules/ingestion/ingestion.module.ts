import { Module } from '@nestjs/common';
import { CommonModule } from '../../common/common.module';
import { ConcurrencyLimiterService } from '../../common/services/concurrency-limiter.service';
import { RepositoryModule } from '../../repositories/repository.module';
import { ConnectionModule } from '../connection/connection.module';
import { FeedIngestionService } from './feed-ingestion.service';

@Module({
  imports: [CommonModule, RepositoryModule, ConnectionModule],
  providers: [FeedIngestionService, ConcurrencyLimiterService],
  exports: [FeedIngestionService],
})
export class IngestionModule {}
