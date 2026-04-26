import { Global, Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { TranslationService } from './services/translation.service';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { GlobalResponseInterceptor } from './interceptors/global-response.interceptor';

@Global()
@Module({
  providers: [
    TranslationService,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: GlobalResponseInterceptor,
    },
  ],
  exports: [TranslationService],
})
export class CommonModule {}
