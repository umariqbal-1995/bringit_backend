import Redis from 'ioredis';
import { env } from './env';

// ─── Redis Client ─────────────────────────────────────────────────────────────
export const redis = new Redis(env.redisUrl, {
  maxRetriesPerRequest: 3,
  enableOfflineQueue: false,
  lazyConnect: true,
});

redis.on('connect', () => console.log('✅  Redis connected'));
redis.on('error', (err: Error) => console.error('❌  Redis error:', err.message));
redis.on('close', () => console.log('🔌  Redis disconnected'));

export async function connectRedis(): Promise<void> {
  await redis.connect();
}

export async function disconnectRedis(): Promise<void> {
  await redis.quit();
}

// ─── Cache Key Factories ──────────────────────────────────────────────────────
export const CacheKeys = {
  storesList: (type?: string) => `stores:list${type ? `:${type}` : ''}`,
  store: (id: string) => `store:${id}`,
  storeProducts: (id: string, page: number, limit: number) =>
    `store:${id}:products:${page}:${limit}`,
  storeMenu: (id: string, page: number, limit: number) =>
    `store:${id}:menu:${page}:${limit}`,
  riderLocation: (id: string) => `rider:${id}:location`,
  otp: (phone: string, role: string) => `otp:${role}:${phone}`,
};
