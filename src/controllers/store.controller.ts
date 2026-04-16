import { Request, Response, NextFunction } from 'express';
import { StoreType } from '@prisma/client';
import { storeService } from '../services/store.service';
import { analyticsRepository } from '../repositories/analytics.repository';
import { sendSuccess, sendCreated } from '../utils/response';
import { parsePagination } from '../utils/pagination';
import {
  UpdateStoreProfileDto, UpdateStoreStatusDto,
  CreateStoreProductDto, UpdateStoreProductDto,
  CreateMenuItemDto, UpdateMenuItemDto,
  CreateRiderDto, UpdateRiderDto,
} from '../dtos/store.dto';

// ─── Public endpoints ─────────────────────────────────────────────────────────

export async function listStores(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page, limit, skip } = parsePagination(req);
    const result = await storeService.listStores(StoreType.STORE, page, limit, skip);
    sendSuccess(res, result.stores, undefined, 200, result.meta);
  } catch (e) { next(e); }
}

export async function listRestaurants(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page, limit, skip } = parsePagination(req);
    const result = await storeService.listStores(StoreType.RESTAURANT, page, limit, skip);
    sendSuccess(res, result.stores, undefined, 200, result.meta);
  } catch (e) { next(e); }
}

export async function getStoreProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page, limit, skip } = parsePagination(req);
    const result = await storeService.getStoreProducts(req.params['id']!, page, limit, skip);
    sendSuccess(res, result.items, undefined, 200, result.meta);
  } catch (e) { next(e); }
}

export async function getRestaurantMenu(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page, limit, skip } = parsePagination(req);
    const result = await storeService.getMenuItems(req.params['id']!, page, limit, skip);
    sendSuccess(res, result.items, undefined, 200, result.meta);
  } catch (e) { next(e); }
}

// ─── Store-authenticated endpoints ────────────────────────────────────────────

export async function getMyStore(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const store = await storeService.getMyStore(req.store!.storeId);
    sendSuccess(res, store);
  } catch (e) { next(e); }
}

export async function updateMyStore(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const store = await storeService.updateMyStore(req.store!.storeId, req.body as UpdateStoreProfileDto);
    sendSuccess(res, store, 'Store profile updated');
  } catch (e) { next(e); }
}

export async function updateStoreStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const store = await storeService.updateStoreStatus(req.store!.storeId, req.body as UpdateStoreStatusDto);
    sendSuccess(res, store, 'Store status updated');
  } catch (e) { next(e); }
}

export async function getDashboardSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const summary = await analyticsRepository.storeSummary(req.store!.storeId);
    sendSuccess(res, summary);
  } catch (e) { next(e); }
}

// ─── Store Products (Grocery) ─────────────────────────────────────────────────

export async function getMyStoreProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page, limit, skip } = parsePagination(req);
    const result = await storeService.getStoreProducts(req.store!.storeId, page, limit, skip);
    sendSuccess(res, result.items, undefined, 200, result.meta);
  } catch (e) { next(e); }
}

export async function createStoreProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const product = await storeService.createStoreProduct(req.store!.storeId, req.body as CreateStoreProductDto);
    sendCreated(res, product, 'Product added to store');
  } catch (e) { next(e); }
}

export async function updateStoreProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const product = await storeService.updateStoreProduct(
      req.store!.storeId, req.params['id']!, req.body as UpdateStoreProductDto,
    );
    sendSuccess(res, product, 'Product updated');
  } catch (e) { next(e); }
}

export async function deleteStoreProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await storeService.deleteStoreProduct(req.store!.storeId, req.params['id']!);
    sendSuccess(res, null, 'Product removed');
  } catch (e) { next(e); }
}

// ─── Menu Items (Restaurant) ──────────────────────────────────────────────────

export async function getMyMenu(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page, limit, skip } = parsePagination(req);
    const result = await storeService.getMenuItems(req.store!.storeId, page, limit, skip);
    sendSuccess(res, result.items, undefined, 200, result.meta);
  } catch (e) { next(e); }
}

export async function createMenuItem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const item = await storeService.createMenuItem(req.store!.storeId, req.body as CreateMenuItemDto);
    sendCreated(res, item, 'Menu item created');
  } catch (e) { next(e); }
}

export async function updateMenuItem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const item = await storeService.updateMenuItem(
      req.store!.storeId, req.params['id']!, req.body as UpdateMenuItemDto,
    );
    sendSuccess(res, item, 'Menu item updated');
  } catch (e) { next(e); }
}

export async function deleteMenuItem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await storeService.deleteMenuItem(req.store!.storeId, req.params['id']!);
    sendSuccess(res, null, 'Menu item removed');
  } catch (e) { next(e); }
}

// ─── Riders (Store Management) ────────────────────────────────────────────────

export async function getStoreRiders(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const riders = await storeService.getStoreRiders(req.store!.storeId);
    sendSuccess(res, riders);
  } catch (e) { next(e); }
}

export async function createRider(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rider = await storeService.createRider(req.store!.storeId, req.body as CreateRiderDto);
    sendCreated(res, rider, 'Rider added');
  } catch (e) { next(e); }
}

export async function updateRider(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rider = await storeService.updateRider(
      req.store!.storeId, req.params['id']!, req.body as UpdateRiderDto,
    );
    sendSuccess(res, rider, 'Rider updated');
  } catch (e) { next(e); }
}

export async function deleteRider(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await storeService.deleteRider(req.store!.storeId, req.params['id']!);
    sendSuccess(res, null, 'Rider removed');
  } catch (e) { next(e); }
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export async function getAnalyticsOverview(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await analyticsRepository.storeSummary(req.store!.storeId);
    sendSuccess(res, data);
  } catch (e) { next(e); }
}

export async function getAnalyticsSales(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await analyticsRepository.storeSalesOverview(req.store!.storeId);
    sendSuccess(res, data);
  } catch (e) { next(e); }
}

export async function getAnalyticsTopProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await analyticsRepository.storeTopProducts(req.store!.storeId);
    sendSuccess(res, data);
  } catch (e) { next(e); }
}

export async function getAnalyticsRevenueTrend(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const days = parseInt(req.query['days'] as string, 10) || 30;
    const data = await analyticsRepository.storeRevenueTrend(req.store!.storeId, days);
    sendSuccess(res, data);
  } catch (e) { next(e); }
}
