import Redis from 'ioredis';
import { env } from './env';
import logger from '../logs/logger';

let redisClient: Redis | null = null;
let isRedisConnected = false;

export function getRedisClient(): Redis | null {
  if (redisClient) return redisClient;

  try {
    redisClient = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      retryStrategy(times) {
        if (times > 3) {
          logger.warn(' Redis server unreachable. Fallback in-memory queues active.');
          return null; // Stop retrying
        }
        return Math.min(times * 100, 2000);
      },
      lazyConnect: true,
      enableOfflineQueue: false,
    });

    redisClient.on('connect', () => {
      isRedisConnected = true;
      logger.info(' Connected to Redis server.');
    });

    redisClient.on('error', (err) => {
      if (isRedisConnected) {
        logger.warn({ err }, '⚠️ Redis connection error:');
      }
      isRedisConnected = false;
    });

    // Attempt initial async connection
    redisClient.connect().catch(() => {
      logger.info('ℹ️ Redis not running locally. Operating in resilient In-Memory queue mode.');
    });

    return redisClient;
  } catch {
    logger.warn('⚠️ Could not initialize Redis client. Operating in In-Memory fallback mode.');
    return null;
  }
}

export function isRedisAvailable(): boolean {
  return isRedisConnected;
}
