import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';
import { apiLimiter } from './middlewares/rateLimiter.middleware';
import { errorHandler } from './middlewares/error.middleware';
import routes from './routes';
import uploadRoutes from './routes/upload.routes';
import { env } from './config/env';

export function createApp(): Application {
  const app = express();

  // ── Security ────────────────────────────────────────────────────────────────
  app.use(helmet());
  app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'] }));

  // ── Body parsing ─────────────────────────────────────────────────────────────
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // ── Compression ──────────────────────────────────────────────────────────────
  app.use(compression());

  // ── HTTP Logging ─────────────────────────────────────────────────────────────
  if (env.nodeEnv !== 'test') {
    app.use(morgan('dev'));
  }

  // ── Rate Limiting ─────────────────────────────────────────────────────────────
  app.use('/api', apiLimiter);

  // ── Static file serving ───────────────────────────────────────────────────────
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // ── Routes ────────────────────────────────────────────────────────────────────
  app.use('/api/v1', routes);
  app.use('/api/v1/upload', uploadRoutes);

  // ── 404 Handler ───────────────────────────────────────────────────────────────
  app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
  });

  // ── Central Error Handler ─────────────────────────────────────────────────────
  app.use(errorHandler);

  return app;
}
