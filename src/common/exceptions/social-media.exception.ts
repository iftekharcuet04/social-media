import { HttpException, HttpStatus } from '@nestjs/common';

export class SocialMediaException extends HttpException {
  constructor(
    public readonly platform: string,
    message: string,
    public readonly isRetryable: boolean,
    status: HttpStatus,
    public readonly originalError?: any,
  ) {
    super(
      {
        statusCode: status,
        message,
        platform,
      },
      status,
    );
  }
}

export class SocialMediaAuthException extends SocialMediaException {
  constructor(platform: string, message = 'Session expired or invalid token', originalError?: any) {
    // 401s are NOT retryable immediately without a token refresh
    super(platform, message, false, HttpStatus.UNAUTHORIZED, originalError);
  }
}

export class SocialMediaRateLimitException extends SocialMediaException {
  constructor(platform: string, message = 'Rate limit exceeded', originalError?: any) {
    // 429s ARE retryable with exponential backoff
    super(platform, message, true, HttpStatus.TOO_MANY_REQUESTS, originalError);
  }
}

export class SocialMediaApiException extends SocialMediaException {
  constructor(platform: string, message: string, isRetryable: boolean, status: HttpStatus, originalError?: any) {
    super(platform, message, isRetryable, status, originalError);
  }
}
