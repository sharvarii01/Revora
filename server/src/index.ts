import { createServer } from './server';
import { env } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/database';
import { getRedisClient } from './config/redis';
import { initRecoveryWorker } from './workers/recoveryWorker';
import { initRetryWorker } from './workers/retryWorker';
import { initNotificationWorker } from './workers/notificationWorker';
import logger from './logs/logger';

async function bootstrap() {
  try {
    // 1. Connect to Database
    await connectDatabase();

    // 2. Initialize Redis (or Fallback In-Memory Queues)
    getRedisClient();

    // 3. Initialize Background Workers
    initRecoveryWorker();
    initRetryWorker();
    initNotificationWorker();

    // 4. Create and start Express server
    const app = createServer();
    const server = app.listen(env.PORT, () => {
      logger.info(`🚀 Revora Backend running on http://localhost:${env.PORT}`);
      logger.info(`📖 Swagger API Docs available at http://localhost:${env.PORT}/api/docs`);
      logger.info(`🩺 Health check at http://localhost:${env.PORT}/health`);
    });

    // 5. Graceful Shutdown
    const shutdown = async (signal: string) => {
      logger.info(`🛑 Received ${signal}. Starting graceful shutdown...`);
      server.close(async () => {
        await disconnectDatabase();
        logger.info('👋 Server shutdown complete. Goodbye.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error({ err: error }, '💥 Fatal error during bootstrap:');
    process.exit(1);
  }
}

bootstrap();
