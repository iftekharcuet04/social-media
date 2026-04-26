import { ConcurrencyLimiterService } from '../src/common/services/concurrency-limiter.service';

describe('Concurrency Verification', () => {
  let limiter: ConcurrencyLimiterService;

  beforeEach(() => {
    limiter = new ConcurrencyLimiterService();
  });

  it('should accept up to MAX_TOTAL_CAPACITY and then reject', async () => {
    const MAX_TOTAL = 150;
    const promises = [];
    let completed = 0;
    let rejected = 0;

    for (let i = 0; i < MAX_TOTAL + 10; i++) {
      promises.push(
        limiter.run(async () => {
          await new Promise((resolve) => setTimeout(resolve, 100));
          completed++;
        }).catch(() => {
          rejected++;
        })
      );
    }

    await Promise.all(promises);

    expect(completed).toBe(MAX_TOTAL);
    expect(rejected).toBe(10);
  });
});
