import { PrismaClient } from '@prisma/client';
import { env } from './env';

// ─── Singleton Prisma Client ──────────────────────────────────────────────────
// Reuse the same instance across hot-reloads in development
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma =
  global.__prisma ??
  new PrismaClient({
    log: env.nodeEnv === 'development' ? ['query', 'warn', 'error'] : ['error'],
  });

if (env.nodeEnv !== 'production') {
  global.__prisma = prisma;
}

export async function connectDatabase(): Promise<void> {
  await prisma.$connect();
  console.log('✅  PostgreSQL connected via Prisma');
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  console.log('🔌  PostgreSQL disconnected');
}
