import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { TranslationService } from '../services/translation.service';

@Injectable()
export class GlobalResponseInterceptor implements NestInterceptor {
  constructor(private readonly translationService: TranslationService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const language = request?.headers['accept-language']?.split('-')[0] || 'en';

    return next.handle().pipe(
      map((data) => {
        const status = response.statusCode || 200;
        const messageKey = data?.message || 'SUCCESS_OPERATION';
        const translatedMessage = this.translationService.translate(messageKey, language);

        return {
          success: true,
          statusCode: status,
          message: translatedMessage || messageKey,
          data: this.cleanData(data),
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }

  private cleanData(data: any) {
    if (typeof data !== 'object' || data === null) return data;
    const { message, ...rest } = data;
    return Object.keys(rest).length === 0 && message !== undefined ? null : rest;
  }
}
