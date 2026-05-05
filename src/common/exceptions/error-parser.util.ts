import { HttpStatus } from '@nestjs/common';
import {
  SocialMediaApiException,
  SocialMediaAuthException,
  SocialMediaRateLimitException,
} from './social-media.exception';

export class SocialMediaErrorParser {
  /**
   * Parses raw errors (like AxiosError) into a standardized SocialMediaException
   */
  static parse(platform: string, error: any): never {
    const status = error?.response?.status || error?.status;

    // Extract message cleanly, catering to deeply nested platform-specific error structures
    let message = error?.message || 'Unknown Social Media API Error';
    if (error?.response?.data) {
      const data = error.response.data;
      if (data.error?.message) {
        message = data.error.message; // Facebook / Instagram Graph API standard
      } else if (data.message) {
        message = data.message;
      }
    }

    const messageLower = message.toLowerCase();

    // 1. Check for Unauthorized / Authentication Errors
    const isUnauthorized =
      status === HttpStatus.UNAUTHORIZED ||
      messageLower.includes('unauthorized') ||
      messageLower.includes('expired') ||
      messageLower.includes('invalid token') ||
      messageLower.includes('session has expired');

    if (isUnauthorized) {
      throw new SocialMediaAuthException(platform, message, error);
    }

    // 2. Check for Rate Limiting Errors
    const isRateLimit = status === HttpStatus.TOO_MANY_REQUESTS;

    if (isRateLimit) {
      throw new SocialMediaRateLimitException(platform, message, error);
    }

    // 3. General API Errors
    // Network errors (ECONNRESET, ETIMEDOUT) or 5xx server errors are usually retryable
    const code = error?.code;
    const isNetworkError =
      code && ['ECONNRESET', 'ENOTFOUND', 'ETIMEDOUT', 'ECONNREFUSED'].includes(code);
    const isServerError = status >= 500 && status <= 599;

    const isRetryable = isNetworkError || isServerError;
    const finalStatus = status || HttpStatus.INTERNAL_SERVER_ERROR;

    throw new SocialMediaApiException(platform, message, !!isRetryable, finalStatus, error);
  }

  /**
   * Helper to wrap promise execution and catch/parse errors automatically.
   */
  static async wrap<T>(platform: string, fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (error: any) {
      this.parse(platform, error);
    }
  }
}
