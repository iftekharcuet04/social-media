import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { Prisma } from '@prisma/client';
import { TranslationService } from '../services/translation.service';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor(private readonly translationService: TranslationService) {}

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const language = (request.headers['accept-language']?.split('-')[0] as string) || 'en';

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'INTERNAL_SERVER_ERROR';
    let errorCode = 'INTERNAL_SERVER_ERROR';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse() as any;
      message = res.message || exception.message;
      errorCode = res.error || 'HTTP_EXCEPTION';
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      status = this.mapPrismaStatus(exception.code);
      message = this.mapPrismaMessage(exception);
      errorCode = `PRISMA_${exception.code}`;
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(`Unhandled Exception: ${exception.message}`, exception.stack);
    }

    let translatedMessage: string | string[];
    if (Array.isArray(message)) {
      translatedMessage = message.map((msg) =>
        this.translationService.translate(msg, language)
      );
    } else {
      translatedMessage = this.translationService.translate(message, language);
    }

    const errorResponse = {
      success: false,
      statusCode: status,
      message: translatedMessage,
      errorCode,
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    if (process.env.NODE_ENV === 'development') {
      (errorResponse as any).stack = exception.stack;
      (errorResponse as any).details = exception.response || null;
    }

    response.status(status).json(errorResponse);
  }

  private mapPrismaStatus(code: string): number {
    switch (code) {
      case 'P2002':
        return HttpStatus.CONFLICT;
      case 'P2003':
        return HttpStatus.UNPROCESSABLE_ENTITY;
      case 'P2025':
        return HttpStatus.NOT_FOUND;
      default:
        return HttpStatus.BAD_REQUEST;
    }
  }

  private mapPrismaMessage(exception: Prisma.PrismaClientKnownRequestError): string {
    switch (exception.code) {
      case 'P2002':
        return `UNIQUE_CONSTRAINT_FAILED`;
      case 'P2003':
        return 'FOREIGN_KEY_CONSTRAINT_FAILED';
      case 'P2025':
        return 'RECORD_NOT_FOUND';
      default:
        return 'DATABASE_ERROR';
    }
  }
}
