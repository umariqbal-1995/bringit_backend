/**
 * Rider Assignment Service
 *
 * Implements both manual and automatic rider assignment strategies:
 * 1. Manual: Store picks a specific rider from its roster.
 * 2. Auto: System picks the nearest available rider within delivery radius,
 *    preferring riders with fewest active orders.
 *
 * Redis is used as the primary source for rider locations.
 * DB is used as fallback when Redis location is absent.
 */

import { prisma } from '../config/database';
import { redis, CacheKeys } from '../config/redis';
import { riderRepository } from '../repositories/rider.repository';
import { orderRepository } from '../repositories/order.repository';
import { haversineDistanceKm } from '../utils/haversine';
import { AppError } from '../middlewares/error.middleware';
import { env } from '../config/env';
import { logger } from '../utils/logger';

interface RiderLocation {
  latitude: number;
  longitude: number;
}

/** Read rider location from Redis first, fallback to DB values */
async function getRiderLocation(riderId: string, dbLat?: number | null, dbLon?: number | null): Promise<RiderLocation | null> {
  const cached = await redis.get(CacheKeys.riderLocation(riderId));
  if (cached) return JSON.parse(cached) as RiderLocation;
  if (dbLat != null && dbLon != null) return { latitude: Number(dbLat), longitude: Number(dbLon) };
  return null;
}

export const riderAssignmentService = {
  /**
   * Manual assignment — store picks a specific rider from its roster.
   * Validates the rider belongs to this store and is available.
   */
  async manualAssign(orderId: string, storeId: string, riderId: string): Promise<string> {
    const rider = await riderRepository.findById(riderId);
    if (!rider) throw new AppError('Rider not found', 404);
    if (rider.storeId !== storeId) throw new AppError('Rider does not belong to this store', 403);
    if (!rider.isAvailable) throw new AppError('Rider is not available', 409);

    await prisma.$transaction([
      prisma.order.update({ where: { id: orderId }, data: { riderId, status: 'ACCEPTED' } }),
      prisma.rider.update({ where: { id: riderId }, data: { isAvailable: false } }),
    ]);

    return riderId;
  },

  /**
   * Auto assignment — find the nearest available rider within delivery radius.
   * Reads locations from Redis; falls back to DB.
   * Sorts by: 1) distance ASC, 2) active orders ASC (least busy).
   */
  async autoAssign(orderId: string, storeId: string): Promise<string | null> {
    // Get store location and delivery radius
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { latitude: true, longitude: true, deliveryRadiusKm: true },
    });
    if (!store) throw new AppError('Store not found', 404);

    const storeLat = Number(store.latitude);
    const storeLon = Number(store.longitude);
    const radiusKm = Number(store.deliveryRadiusKm);

    // Get all globally available riders
    const availableRiders = await riderRepository.findAvailableRidersGlobal();

    // Build candidates with location and distance
    const candidates: { id: string; distance: number }[] = [];

    for (const rider of availableRiders) {
      const loc = await getRiderLocation(rider.id, rider.latitude as number | null, rider.longitude as number | null);
      if (!loc) continue; // No location data — skip

      const distance = haversineDistanceKm(storeLat, storeLon, loc.latitude, loc.longitude);
      if (distance <= radiusKm) {
        candidates.push({ id: rider.id, distance });
      }
    }

    if (candidates.length === 0) {
      logger.warn(`Auto assignment: no available riders for order ${orderId}`);
      return null;
    }

    // Sort by distance, then by active orders (least busy)
    const candidatesWithLoad = await Promise.all(
      candidates.map(async (c) => ({
        ...c,
        activeOrders: await orderRepository.countActiveOrdersByRider(c.id),
      })),
    );

    candidatesWithLoad.sort((a, b) => {
      if (a.distance !== b.distance) return a.distance - b.distance;
      return a.activeOrders - b.activeOrders;
    });

    const bestRider = candidatesWithLoad[0];

    // Assign in a transaction
    await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: { riderId: bestRider.id, status: 'ACCEPTED' },
      }),
      prisma.rider.update({
        where: { id: bestRider.id },
        data: { isAvailable: false },
      }),
    ]);

    logger.info(`Auto assigned rider ${bestRider.id} to order ${orderId} (${bestRider.distance.toFixed(2)} km away)`);
    return bestRider.id;
  },

  /**
   * Schedule a retry for auto assignment if no rider was found.
   * Runs once after RIDER_ASSIGNMENT_RETRY_INTERVAL_MS ms.
   */
  scheduleRetry(orderId: string, storeId: string): void {
    setTimeout(async () => {
      // Check if order still needs a rider
      const order = await orderRepository.findByIdRaw(orderId);
      if (!order || order.riderId || order.status !== 'ACCEPTED') return;

      logger.info(`Retrying auto assignment for order ${orderId}`);
      await riderAssignmentService.autoAssign(orderId, storeId);
    }, env.riderAssignmentRetryMs);
  },
};
