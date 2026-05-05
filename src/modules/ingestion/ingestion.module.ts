import { Module } from '@nestjs/common';
import { CommonModule } from '../../common/common.module';
import { ConcurrencyLimiterService } from '../../common/services/concurrency-limiter.service';
import { RepositoryModule } from '../../repositories/repository.module';
import { FeedIngestionService } from './feed-ingestion.service';
import { TOKEN_REFRESHER } from '../interfaces/token-refresher.interface';

@Module({
  imports: [CommonModule, RepositoryModule],
  providers: [
    FeedIngestionService,
    ConcurrencyLimiterService,
    { provide: TOKEN_REFRESHER, useValue: null }, // overridden by ConnectionModule
  ],
  exports: [FeedIngestionService, TOKEN_REFRESHER],
})
export class IngestionModule {}
