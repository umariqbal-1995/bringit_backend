import { Request, Response, NextFunction } from 'express';
import { riderService } from '../services/rider.service';
import { analyticsRepository } from '../repositories/analytics.repository';
import { sendSuccess } from '../utils/response';
import { parsePagination } from '../utils/pagination';
import {
  UpdateRiderProfileDto,
  UpdateRiderAvailabilityDto,
  UpdateRiderLocationDto,
} from '../dtos/rider.dto';
import { getSocketServer } from '../sockets';

export async function getRiderMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rider = await riderService.getMe(req.rider!.riderId);
    sendSuccess(res, rider);
  } catch (e) { next(e); }
}

export async function updateRiderMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rider = await riderService.updateMe(req.rider!.riderId, req.body as UpdateRiderProfileDto);
    sendSuccess(res, rider, 'Profile updated');
  } catch (e) { next(e); }
}

export async function updateAvailability(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await riderService.updateAvailability(
      req.rider!.riderId, req.body as UpdateRiderAvailabilityDto,
    );
    sendSuccess(res, result, 'Availability updated');
  } catch (e) { next(e); }
}

/** REST endpoint for location update (alternative to socket) */
export async function updateLocation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { shouldEmit, latitude, longitude } = await riderService.updateLocation(
      req.rider!.riderId, req.body as UpdateRiderLocationDto,
    );

    // Emit socket event if threshold exceeded
    if (shouldEmit) {
      const io = getSocketServer();
      io.emit(`rider:${req.rider!.riderId}:location`, { latitude, longitude });
    }

    sendSuccess(res, { latitude, longitude }, 'Location updated');
  } catch (e) { next(e); }
}

// ─── Earnings ─────────────────────────────────────────────────────────────────

export async function getEarningsSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await analyticsRepository.riderEarningsSummary(req.rider!.riderId);
    sendSuccess(res, data);
  } catch (e) { next(e); }
}

export async function getEarningsHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page, limit, skip } = parsePagination(req);
    const { orders, total } = await analyticsRepository.riderEarningsHistory(req.rider!.riderId, skip, limit);
    const { buildMeta } = await import('../utils/pagination');
    sendSuccess(res, orders, undefined, 200, buildMeta(page, limit, total));
  } catch (e) { next(e); }
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export async function getRiderAnalyticsOverview(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await analyticsRepository.riderEarningsSummary(req.rider!.riderId);
    sendSuccess(res, data);
  } catch (e) { next(e); }
}

export async function getRiderAnalyticsEarnings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page, limit, skip } = parsePagination(req);
    const { orders, total } = await analyticsRepository.riderEarningsHistory(req.rider!.riderId, skip, limit);
    const { buildMeta } = await import('../utils/pagination');
    sendSuccess(res, orders, undefined, 200, buildMeta(page, limit, total));
  } catch (e) { next(e); }
}

export async function getRiderAnalyticsDeliveries(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await analyticsRepository.riderPerformance(req.rider!.riderId);
    sendSuccess(res, data);
  } catch (e) { next(e); }
}

export async function getRiderAnalyticsPerformance(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await analyticsRepository.riderPerformance(req.rider!.riderId);
    sendSuccess(res, data);
  } catch (e) { next(e); }
}
