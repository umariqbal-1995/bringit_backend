import jwt from 'jsonwebtoken';
import { env } from '../config/env';

// ─── Token Payload Types ──────────────────────────────────────────────────────
export interface UserTokenPayload {
  userId: string;
  role: 'USER';
}

export interface StoreTokenPayload {
  storeId: string;
  role: 'STORE';
}

export interface RiderTokenPayload {
  riderId: string;
  role: 'RIDER';
}

export type TokenPayload = UserTokenPayload | StoreTokenPayload | RiderTokenPayload;

// ─── Sign helpers ─────────────────────────────────────────────────────────────
export function signUserToken(userId: string): string {
  return jwt.sign({ userId, role: 'USER' } satisfies UserTokenPayload, env.jwt.userSecret, {
    expiresIn: env.jwt.expiresIn as jwt.SignOptions['expiresIn'],
  });
}

export function signStoreToken(storeId: string): string {
  return jwt.sign({ storeId, role: 'STORE' } satisfies StoreTokenPayload, env.jwt.storeSecret, {
    expiresIn: env.jwt.expiresIn as jwt.SignOptions['expiresIn'],
  });
}

export function signRiderToken(riderId: string): string {
  return jwt.sign({ riderId, role: 'RIDER' } satisfies RiderTokenPayload, env.jwt.riderSecret, {
    expiresIn: env.jwt.expiresIn as jwt.SignOptions['expiresIn'],
  });
}

// ─── Verify helpers ───────────────────────────────────────────────────────────
export function verifyUserToken(token: string): UserTokenPayload {
  return jwt.verify(token, env.jwt.userSecret) as UserTokenPayload;
}

export function verifyStoreToken(token: string): StoreTokenPayload {
  return jwt.verify(token, env.jwt.storeSecret) as StoreTokenPayload;
}

export function verifyRiderToken(token: string): RiderTokenPayload {
  return jwt.verify(token, env.jwt.riderSecret) as RiderTokenPayload;
}

/** Extract raw token from Authorization header (Bearer scheme) */
export function extractBearerToken(authHeader: string | undefined): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null;
  return authHeader.slice(7);
}
