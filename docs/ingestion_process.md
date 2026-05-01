# Social Media Feed Ingestion Process

This document outlines the architecture and strategy used for ingesting feeds from various social media platforms. It serves as a guide for integrating new platforms into our high-throughput data ingestion pipeline.

## Core Components

The ingestion process relies on two core architectural components to ensure stability and performance:

1. **`ConcurrencyLimiterService`**: Throttles database operations and API requests to prevent connection exhaustion and memory overload.
2. **`FeedIngestionService`**: Orchestrates the fetching of data from third-party APIs and saving it to the database with a resilient, recursive retry mechanism.

## Recursive Retry with Exponential Backoff

When integrating with third-party social media APIs (like Facebook, Instagram, LinkedIn), network errors and rate limits (HTTP 429) are common. The `FeedIngestionService` mitigates this using a recursive retry pattern with exponential backoff.

### How it works:

1. **Fetch Call**: The service receives a `fetchPageFn` callback, which performs the actual HTTP request (via `axios` or `fetch`).
2. **Error Handling**: If the fetch fails, the service checks if the error is retryable (e.g., 429 Too Many Requests, 500, 502, 503, 504).
3. **Exponential Backoff**: If retryable, the service pauses execution for a duration that grows exponentially with each attempt (e.g., $2^{\text{retry\_count}} \times 1000$ milliseconds).
4. **Recursive Execution**: After the pause, the function calls itself recursively with an incremented `retryCount` until the maximum number of retries is reached.
5. **Next Page**: If the fetch succeeds and returns a `nextCursor`, the recursive function is called again for the next page, resetting the `retryCount` to 0.

## Integrating a New Platform

To ingest feeds from a new platform, follow these steps:

1. **Implement the Fetcher**: Create a function that uses `fetch` or `axios` to retrieve a single page of feed data from the platform's API. This function must conform to the signature expected by `FeedIngestionService`:
   ```typescript
   async fetchPageFn(cursor?: string): Promise<{ data: any[], nextCursor?: string }>
   ```

2. **Map the Data**: Map the raw API response data to the `Prisma.SocialPostCreateInput` format. Ensure you capture the real ID of the post and set it to the `original_post_id` field in the database. This is crucial for future updates, deletions, or retries. Store the direct post URL in `post_url`.

3. **Call `ingestFeeds`**: Inject `FeedIngestionService` into your platform-specific module/service and call `ingestFeeds`:
   ```typescript
   await this.feedIngestionService.ingestFeeds(
     ConnectionPlatform.NEW_PLATFORM,
     connectionId,
     fetchPageFn
   );
   ```

## Example Integration

```typescript
async syncFeeds(connectionId: string, accessToken: string) {
  const fetchPageFn = async (cursor?: string) => {
    const url = cursor 
      ? `https://api.example.com/v1/me/posts?after=${cursor}` 
      : `https://api.example.com/v1/me/posts`;
      
    const response = await axios.get(url, { headers: { Authorization: `Bearer ${accessToken}` } });
    
    // Map response to SocialPost format
    const data = response.data.items.map(item => ({
      connection_id: connectionId,
      platform: ConnectionPlatform.NEW_PLATFORM,
      original_post_id: item.id,
      post_url: item.permalink,
      message: item.text,
      urls: item.mediaUrls || [],
    }));
    
    return {
      data,
      nextCursor: response.data.paging?.cursors?.after
    };
  };

  await this.feedIngestionService.ingestFeeds(
    ConnectionPlatform.NEW_PLATFORM,
    connectionId,
    fetchPageFn
  );
}
```
