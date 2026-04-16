import twilio from 'twilio';
import { env } from '../config/env';
import { redis } from '../config/redis';
import { CacheKeys } from '../config/redis';
import { logger } from './logger';

const twilioClient = twilio(env.twilio.accountSid, env.twilio.authToken);

/** Generate a numeric OTP of the configured length */
export function generateOtp(): string {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < env.otp.length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  return otp;
}

const DEV_OTP = '123456';

/** Send OTP via Twilio SMS and store in Redis */
export async function sendOtp(phone: string, role: 'USER' | 'STORE' | 'RIDER'): Promise<void> {
  if (env.nodeEnv === 'development') {
    // In dev mode, always use fixed OTP and skip Twilio
    const key = CacheKeys.otp(phone, role);
    await redis.setex(key, env.otp.expirySeconds, DEV_OTP);
    logger.info(`[DEV] OTP for ${phone} (${role}): ${DEV_OTP}`);
    return;
  }

  const otp = generateOtp();
  const key = CacheKeys.otp(phone, role);

  await redis.setex(key, env.otp.expirySeconds, otp);

  await twilioClient.messages.create({
    body: `Your BringIt verification code is: ${otp}. Valid for ${env.otp.expirySeconds / 60} minutes.`,
    from: env.twilio.phoneNumber,
    to: phone,
  });
}

/** Verify OTP — returns true if valid and deletes it from Redis */
export async function verifyOtp(
  phone: string,
  role: 'USER' | 'STORE' | 'RIDER',
  otp: string,
): Promise<boolean> {
  const key = CacheKeys.otp(phone, role);
  const stored = await redis.get(key);
  if (!stored || stored !== otp) return false;
  // Delete after successful verification (one-time use)
  await redis.del(key);
  return true;
}
