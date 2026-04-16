import { Request, Response, NextFunction } from 'express';
import { favoriteService } from '../services/favorite.service';
import { sendSuccess, sendCreated } from '../utils/response';
import { parsePagination } from '../utils/pagination';

export async function getFavorites(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page, limit, skip } = parsePagination(req);
    const result = await favoriteService.getFavorites(req.user!.userId, page, limit, skip);
    sendSuccess(res, result.favorites, undefined, 200, result.meta);
  } catch (e) { next(e); }
}

export async function addFavorite(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const fav = await favoriteService.addFavorite(req.user!.userId, req.params['storeId']!);
    sendCreated(res, fav, 'Added to favorites');
  } catch (e) { next(e); }
}

export async function removeFavorite(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await favoriteService.removeFavorite(req.user!.userId, req.params['storeId']!);
    sendSuccess(res, null, 'Removed from favorites');
  } catch (e) { next(e); }
}
