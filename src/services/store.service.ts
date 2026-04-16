import { StoreType } from '@prisma/client';
import { storeRepository } from '../repositories/store.repository';
import { riderRepository } from '../repositories/rider.repository';
import { AppError } from '../middlewares/error.middleware';
import { redis, CacheKeys } from '../config/redis';
import { invalidateCachePattern, cacheAside, invalidateCache } from '../utils/cache';
import { env } from '../config/env';
import {
  UpdateStoreProfileDto,
  UpdateStoreStatusDto,
  CreateStoreProductDto,
  UpdateStoreProductDto,
  CreateMenuItemDto,
  UpdateMenuItemDto,
  CreateRiderDto,
  UpdateRiderDto,
} from '../dtos/store.dto';
import { buildMeta } from '../utils/pagination';

export const storeService = {
  // ─── Profile ─────────────────────────────────────────────────────────────

  async getMyStore(storeId: string) {
    const store = await storeRepository.findById(storeId);
    if (!store) throw new AppError('Store not found', 404);
    return store;
  },

  async updateMyStore(storeId: string, data: UpdateStoreProfileDto) {
    const store = await storeRepository.update(storeId, data);
    // Invalidate store cache
    await invalidateCache(CacheKeys.store(storeId));
    await invalidateCachePattern(`${CacheKeys.storesList()}*`);
    return store;
  },

  async updateStoreStatus(storeId: string, data: UpdateStoreStatusDto) {
    const store = await storeRepository.update(storeId, { isOpen: data.isOpen });
    await invalidateCache(CacheKeys.store(storeId));
    return store;
  },

  // ─── Public Store Listings ────────────────────────────────────────────────

  async listStores(type: StoreType, page: number, limit: number, skip: number) {
    const cacheKey = `${CacheKeys.storesList(type)}:${page}:${limit}`;
    return cacheAside(
      cacheKey,
      async () => {
        const { stores, total } = await storeRepository.listStores(type, skip, limit);
        return { stores, meta: buildMeta(page, limit, total) };
      },
      env.cache.storesList,
    );
  },

  async getStoreById(storeId: string) {
    return cacheAside(
      CacheKeys.store(storeId),
      async () => {
        const store = await storeRepository.findById(storeId);
        if (!store) throw new AppError('Store not found', 404);
        return store;
      },
      env.cache.store,
    );
  },

  // ─── Store Products ────────────────────────────────────────────────────────

  async getStoreProducts(storeId: string, page: number, limit: number, skip: number) {
    const cacheKey = CacheKeys.storeProducts(storeId, page, limit);
    return cacheAside(
      cacheKey,
      async () => {
        const { items, total } = await storeRepository.getStoreProducts(storeId, skip, limit);
        return { items, meta: buildMeta(page, limit, total) };
      },
      env.cache.storeProducts,
    );
  },

  async createStoreProduct(storeId: string, data: CreateStoreProductDto) {
    const product = await storeRepository.createStoreProduct(storeId, data);
    await invalidateCachePattern(`store:${storeId}:products:*`);
    return product;
  },

  async updateStoreProduct(storeId: string, productId: string, data: UpdateStoreProductDto) {
    const existing = await storeRepository.findStoreProduct(productId, storeId);
    if (!existing) throw new AppError('Product not found', 404);
    await storeRepository.updateStoreProduct(productId, storeId, data);
    await invalidateCachePattern(`store:${storeId}:products:*`);
    return storeRepository.findStoreProduct(productId, storeId);
  },

  async deleteStoreProduct(storeId: string, productId: string) {
    const existing = await storeRepository.findStoreProduct(productId, storeId);
    if (!existing) throw new AppError('Product not found', 404);
    await storeRepository.deleteStoreProduct(productId, storeId);
    await invalidateCachePattern(`store:${storeId}:products:*`);
  },

  // ─── Menu Items ────────────────────────────────────────────────────────────

  async getMenuItems(storeId: string, page: number, limit: number, skip: number) {
    const cacheKey = CacheKeys.storeMenu(storeId, page, limit);
    return cacheAside(
      cacheKey,
      async () => {
        const { items, total } = await storeRepository.getMenuItems(storeId, skip, limit);
        return { items, meta: buildMeta(page, limit, total) };
      },
      env.cache.storeMenu,
    );
  },

  async createMenuItem(storeId: string, data: CreateMenuItemDto) {
    const item = await storeRepository.createMenuItem(storeId, { ...data, storeId });
    await invalidateCachePattern(`store:${storeId}:menu:*`);
    return item;
  },

  async updateMenuItem(storeId: string, itemId: string, data: UpdateMenuItemDto) {
    const existing = await storeRepository.findMenuItem(itemId, storeId);
    if (!existing) throw new AppError('Menu item not found', 404);
    await storeRepository.updateMenuItem(itemId, storeId, data);
    await invalidateCachePattern(`store:${storeId}:menu:*`);
    return storeRepository.findMenuItem(itemId, storeId);
  },

  async deleteMenuItem(storeId: string, itemId: string) {
    const existing = await storeRepository.findMenuItem(itemId, storeId);
    if (!existing) throw new AppError('Menu item not found', 404);
    await storeRepository.deleteMenuItem(itemId, storeId);
    await invalidateCachePattern(`store:${storeId}:menu:*`);
  },

  // ─── Riders Management ─────────────────────────────────────────────────────

  async getStoreRiders(storeId: string) {
    return riderRepository.findByStore(storeId);
  },

  async createRider(storeId: string, data: CreateRiderDto) {
    // Check if rider already exists — if so, associate with this store
    const existing = await riderRepository.findByPhone(data.phone);
    if (existing) {
      return riderRepository.update(existing.id, { store: { connect: { id: storeId } } });
    }
    return riderRepository.create({ phone: data.phone, name: data.name, storeId });
  },

  async updateRider(storeId: string, riderId: string, data: UpdateRiderDto) {
    const rider = await riderRepository.findById(riderId);
    if (!rider || rider.storeId !== storeId) throw new AppError('Rider not found', 404);
    return riderRepository.update(riderId, data);
  },

  async deleteRider(storeId: string, riderId: string) {
    const rider = await riderRepository.findById(riderId);
    if (!rider || rider.storeId !== storeId) throw new AppError('Rider not found', 404);
    return riderRepository.deleteFromStore(riderId, storeId);
  },
};
