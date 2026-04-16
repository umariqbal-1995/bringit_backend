import { createServer } from 'http';
import { createApp } from './app';
import { connectDatabase, disconnectDatabase } from './config/database';
import { connectRedis, disconnectRedis } from './config/redis';
import { initSocketServer } from './sockets';
import { env } from './config/env';
import { logger } from './utils/logger';

async function bootstrap(): Promise<void> {
  // ── Connect to external services ─────────────────────────────────────────────
  await connectDatabase();
  await connectRedis();

  // ── Create Express app & HTTP server ─────────────────────────────────────────
  const app = createApp();
  const httpServer = createServer(app);

  // ── Attach Socket.IO ──────────────────────────────────────────────────────────
  initSocketServer(httpServer);

  // ── Start listening ───────────────────────────────────────────────────────────
  httpServer.listen(env.port, () => {
    logger.info(`🚀  BringIt API running on http://localhost:${env.port}`);
    logger.info(`📡  Socket.IO ready on ws://localhost:${env.port}`);
    logger.info(`🌍  Environment: ${env.nodeEnv}`);
  });

  // ── Graceful shutdown ─────────────────────────────────────────────────────────
  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    httpServer.close(async () => {
      await disconnectDatabase();
      await disconnectRedis();
      logger.info('Server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Promise Rejection', { reason });
  });

  process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception', { err });
    process.exit(1);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
