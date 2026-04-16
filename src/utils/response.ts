import { Response } from 'express';

// ─── Standard API Response Shape ─────────────────────────────────────────────
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: PaginationMeta;
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  message?: string,
  statusCode = 200,
  meta?: PaginationMeta,
): Response {
  const body: ApiResponse<T> = { success: true, data, message, meta };
  // Remove undefined keys
  if (!message) delete body.message;
  if (!meta) delete body.meta;
  return res.status(statusCode).json(body);
}

export function sendCreated<T>(res: Response, data: T, message?: string): Response {
  return sendSuccess(res, data, message, 201);
}

export function sendError(res: Response, message: string, statusCode = 400): Response {
  return res.status(statusCode).json({ success: false, message });
}
