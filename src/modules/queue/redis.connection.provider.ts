import { Provider, Logger } from '@nestjs/common';
import IORedis from 'ioredis';

export const REDIS_CONNECTION = Symbol('REDIS_CONNECTION');

export const RedisConnectionProvider: Provider = {
  provide: REDIS_CONNECTION,
  useFactory: () => {
    const host = process.env.REDIS_HOST || '127.0.0.1';
    const port = parseInt(process.env.REDIS_PORT || '6379', 10);
    const logger = new Logger('RedisConnectionProvider');

    const connection = new IORedis({
      host,
      port,
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      lazyConnect: true, // Don't block module init — connect only on first use
    });

    connection.on('connect', () => logger.log(`Redis connected at ${host}:${port}`));
    connection.on('error', (err) => logger.error(`Redis error: ${err.message}`));

    return connection;
  },
};
