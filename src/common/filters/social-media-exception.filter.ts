import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import { SocialMediaException } from '../exceptions/social-media.exception';

@Catch(SocialMediaException)
export class SocialMediaExceptionFilter implements ExceptionFilter {
  catch(exception: SocialMediaException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    const exceptionResponse = exception.getResponse() as any;

    response.status(status).json({
      statusCode: status,
      platform: exception.platform,
      message: exceptionResponse.message || exception.message,
      isRetryable: exception.isRetryable,
      timestamp: new Date().toISOString(),
    });
  }
}
