import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

// ─── Validate all required env vars at startup ───────────────────────────────
const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  JWT_USER_SECRET: z.string().min(32),
  JWT_STORE_SECRET: z.string().min(32),
  JWT_RIDER_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),

  TWILIO_ACCOUNT_SID: z.string().min(1),
  TWILIO_AUTH_TOKEN: z.string().min(1),
  TWILIO_PHONE_NUMBER: z.string().min(1),

  OTP_EXPIRY_SECONDS: z.string().default('300'),
  OTP_LENGTH: z.string().default('6'),

  CACHE_TTL_STORES_LIST: z.string().default('300'),
  CACHE_TTL_STORE: z.string().default('120'),
  CACHE_TTL_STORE_PRODUCTS: z.string().default('120'),
  CACHE_TTL_STORE_MENU: z.string().default('120'),
  CACHE_TTL_RIDER_LOCATION: z.string().default('60'),

  RIDER_ASSIGNMENT_RETRY_INTERVAL_MS: z.string().default('30000'),

  RATE_LIMIT_WINDOW_MS: z.string().default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100'),
  AUTH_RATE_LIMIT_MAX: z.string().default('10'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌  Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = {
  databaseUrl: parsed.data.DATABASE_URL,
  redisUrl: parsed.data.REDIS_URL,
  port: parseInt(parsed.data.PORT, 10),
  nodeEnv: parsed.data.NODE_ENV,

  jwt: {
    userSecret: parsed.data.JWT_USER_SECRET,
    storeSecret: parsed.data.JWT_STORE_SECRET,
    riderSecret: parsed.data.JWT_RIDER_SECRET,
    expiresIn: parsed.data.JWT_EXPIRES_IN,
    refreshExpiresIn: parsed.data.JWT_REFRESH_EXPIRES_IN,
  },

  twilio: {
    accountSid: parsed.data.TWILIO_ACCOUNT_SID,
    authToken: parsed.data.TWILIO_AUTH_TOKEN,
    phoneNumber: parsed.data.TWILIO_PHONE_NUMBER,
  },

  otp: {
    expirySeconds: parseInt(parsed.data.OTP_EXPIRY_SECONDS, 10),
    length: parseInt(parsed.data.OTP_LENGTH, 10),
  },

  cache: {
    storesList: parseInt(parsed.data.CACHE_TTL_STORES_LIST, 10),
    store: parseInt(parsed.data.CACHE_TTL_STORE, 10),
    storeProducts: parseInt(parsed.data.CACHE_TTL_STORE_PRODUCTS, 10),
    storeMenu: parseInt(parsed.data.CACHE_TTL_STORE_MENU, 10),
    riderLocation: parseInt(parsed.data.CACHE_TTL_RIDER_LOCATION, 10),
  },

  riderAssignmentRetryMs: parseInt(parsed.data.RIDER_ASSIGNMENT_RETRY_INTERVAL_MS, 10),

  rateLimit: {
    windowMs: parseInt(parsed.data.RATE_LIMIT_WINDOW_MS, 10),
    max: parseInt(parsed.data.RATE_LIMIT_MAX_REQUESTS, 10),
    authMax: parseInt(parsed.data.AUTH_RATE_LIMIT_MAX, 10),
  },
};
