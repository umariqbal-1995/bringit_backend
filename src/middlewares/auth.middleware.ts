import { Request, Response, NextFunction } from 'express';
import {
  verifyUserToken,
  verifyStoreToken,
  verifyRiderToken,
  extractBearerToken,
  UserTokenPayload,
  StoreTokenPayload,
  RiderTokenPayload,
} from '../utils/jwt';
import { sendError } from '../utils/response';

// ─── Extend Express Request with auth context ─────────────────────────────────
declare global {
  namespace Express {
    interface Request {
      user?: UserTokenPayload;
      store?: StoreTokenPayload;
      rider?: RiderTokenPayload;
    }
  }
}

/** Protect routes for authenticated CUSTOMERS */
export function requireUser(req: Request, res: Response, next: NextFunction): void {
  const token = extractBearerToken(req.headers.authorization);
  if (!token) {
    sendError(res, 'Authentication required', 401);
    return;
  }
  try {
    req.user = verifyUserToken(token);
    next();
  } catch {
    sendError(res, 'Invalid or expired token', 401);
  }
}

/** Protect routes for authenticated STORES */
export function requireStore(req: Request, res: Response, next: NextFunction): void {
  const token = extractBearerToken(req.headers.authorization);
  if (!token) {
    sendError(res, 'Authentication required', 401);
    return;
  }
  try {
    req.store = verifyStoreToken(token);
    next();
  } catch {
    sendError(res, 'Invalid or expired token', 401);
  }
}

/** Protect routes for authenticated RIDERS */
export function requireRider(req: Request, res: Response, next: NextFunction): void {
  const token = extractBearerToken(req.headers.authorization);
  if (!token) {
    sendError(res, 'Authentication required', 401);
    return;
  }
  try {
    req.rider = verifyRiderToken(token);
    next();
  } catch {
    sendError(res, 'Invalid or expired token', 401);
  }
}
