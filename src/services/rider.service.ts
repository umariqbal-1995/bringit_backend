import { riderRepository } from '../repositories/rider.repository';
import { redis, CacheKeys } from '../config/redis';
import { env } from '../config/env';
import { AppError } from '../middlewares/error.middleware';
import { UpdateRiderProfileDto, UpdateRiderAvailabilityDto, UpdateRiderLocationDto } from '../dtos/rider.dto';
import {
  haversineDistanceKm,
  RIDER_LOCATION_UPDATE_THRESHOLD_M,
  metresToKm,
} from '../utils/haversine';

export const riderService = {
  async getMe(riderId: string) {
    const rider = await riderRepository.findById(riderId);
    if (!rider) throw new AppError('Rider not found', 404);
    return rider;
  },

  async updateMe(riderId: string, data: UpdateRiderProfileDto) {
    return riderRepository.update(riderId, data);
  },

  async updateAvailability(riderId: string, dto: UpdateRiderAvailabilityDto) {
    return riderRepository.updateAvailability(riderId, dto.isAvailable);
  },

  /**
   * Update rider location:
   * 1. Persist to Redis (primary real-time store)
   * 2. Update DB (for persistence / fallback)
   * 3. Return whether threshold was exceeded (caller uses this to decide socket emit)
   */
  async updateLocation(
    riderId: string,
    dto: UpdateRiderLocationDto,
  ): Promise<{ shouldEmit: boolean; latitude: number; longitude: number }> {
    const { latitude, longitude } = dto;

    // Read current location from Redis
    const cacheKey = CacheKeys.riderLocation(riderId);
    const cached = await redis.get(cacheKey);

    let shouldEmit = false;

    if (cached) {
      const prev = JSON.parse(cached) as { latitude: number; longitude: number };
      const distanceKm = haversineDistanceKm(prev.latitude, prev.longitude, latitude, longitude);
      const thresholdKm = metresToKm(RIDER_LOCATION_UPDATE_THRESHOLD_M);
      shouldEmit = distanceKm >= thresholdKm;
    } else {
      // First location — always emit
      shouldEmit = true;
    }

    // Always update Redis
    await redis.setex(cacheKey, env.cache.riderLocation, JSON.stringify({ latitude, longitude }));

    // Always update DB for persistence (non-blocking for real-time feel)
    await riderRepository.updateLocation(riderId, latitude, longitude);

    return { shouldEmit, latitude, longitude };
  },
};
