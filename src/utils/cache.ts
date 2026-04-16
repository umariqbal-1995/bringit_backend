import { redis } from '../config/redis';

/**
 * Generic cache-aside helper.
 * If data is in Redis return it; otherwise call `fetcher`, store, and return.
 */
export async function cacheAside<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number,
): Promise<T> {
  const cached = await redis.get(key);
  if (cached) {
    return JSON.parse(cached) as T;
  }
  const data = await fetcher();
  await redis.setex(key, ttlSeconds, JSON.stringify(data));
  return data;
}

/** Delete one or more cache keys */
export async function invalidateCache(...keys: string[]): Promise<void> {
  if (keys.length === 0) return;
  await redis.del(...keys);
}

/** Delete all keys matching a pattern (use sparingly — SCAN based) */
export async function invalidateCachePattern(pattern: string): Promise<void> {
  const keys: string[] = [];
  let cursor = '0';
  do {
    const [nextCursor, found] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
    cursor = nextCursor;
    keys.push(...found);
  } while (cursor !== '0');

  if (keys.length > 0) {
    await redis.del(...keys);
  }
}
