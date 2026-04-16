import { Request } from 'express';
import { PaginationMeta } from './response';

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

/** Parse page/limit query params with safe defaults */
export function parsePagination(req: Request, defaultLimit = 20): PaginationParams {
  const page = Math.max(1, parseInt(req.query['page'] as string, 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, parseInt(req.query['limit'] as string, 10) || defaultLimit),
  );
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

/** Build pagination meta for the response */
export function buildMeta(page: number, limit: number, total: number): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}
