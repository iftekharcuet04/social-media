import { forwardRef, Module } from '@nestjs/common';
import { CommonModule } from '../../common/common.module';
import { RepositoryModule } from '../../repositories/repository.module';
import { FeedIngestionService } from './feed-ingestion.service';
import { ConnectionModule } from '../connection/connection.module';

@Module({
  imports: [CommonModule, RepositoryModule, forwardRef(() => ConnectionModule)],
  providers: [FeedIngestionService],
  exports: [FeedIngestionService],
})
export class IngestionModule {}
