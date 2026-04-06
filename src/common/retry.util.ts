import { delay } from './util';

export interface RetryOptions {
  retries?: number;
  delayMs?: number;
  label?: string;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const { retries = 3, delayMs = 3000, label = 'operation' } = options;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await fn();
      if (attempt > 1) {
        console.log(`${label} succeeded on attempt ${attempt}`);
      }
      return result;
    } catch (error) {
      console.warn(
        `${label} attempt ${attempt} failed: ${
          error?.response?.data?.error?.message || error.message
        }`,
      );

      if (attempt < retries) {
        console.log(`Retrying ${label} in ${delayMs / 1000}s...`);
        await delay(delayMs);
      } else {
        console.error(`All ${label} attempts failed`);
        throw error;
      }
    }
  }

  // Unreachable, but satisfies TypeScript
  throw new Error(`${label} failed after ${retries} attempts`);
}
