import { Request, Response, NextFunction } from 'express';
import { NotificationReceiverType } from '@prisma/client';
import { notificationService } from '../services/notification.service';
import { sendSuccess } from '../utils/response';
import { parsePagination } from '../utils/pagination';

// ─── User Notifications ───────────────────────────────────────────────────────

export async function getUserNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page, limit, skip } = parsePagination(req);
    const result = await notificationService.getNotifications(
      NotificationReceiverType.USER, req.user!.userId, page, limit, skip,
    );
    sendSuccess(res, result.notifications, undefined, 200, result.meta);
  } catch (e) { next(e); }
}

export async function markUserNotifRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await notificationService.markRead(req.user!.userId, req.params['id']!);
    sendSuccess(res, null, 'Notification marked as read');
  } catch (e) { next(e); }
}

export async function markAllUserNotifsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await notificationService.markAllRead(NotificationReceiverType.USER, req.user!.userId);
    sendSuccess(res, null, 'All notifications marked as read');
  } catch (e) { next(e); }
}

// ─── Store Notifications ──────────────────────────────────────────────────────

export async function getStoreNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page, limit, skip } = parsePagination(req);
    const result = await notificationService.getNotifications(
      NotificationReceiverType.STORE, req.store!.storeId, page, limit, skip,
    );
    sendSuccess(res, result.notifications, undefined, 200, result.meta);
  } catch (e) { next(e); }
}

export async function markStoreNotifRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await notificationService.markRead(req.store!.storeId, req.params['id']!);
    sendSuccess(res, null, 'Notification marked as read');
  } catch (e) { next(e); }
}

export async function markAllStoreNotifsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await notificationService.markAllRead(NotificationReceiverType.STORE, req.store!.storeId);
    sendSuccess(res, null, 'All notifications marked as read');
  } catch (e) { next(e); }
}

// ─── Rider Notifications ──────────────────────────────────────────────────────

export async function getRiderNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page, limit, skip } = parsePagination(req);
    const result = await notificationService.getNotifications(
      NotificationReceiverType.RIDER, req.rider!.riderId, page, limit, skip,
    );
    sendSuccess(res, result.notifications, undefined, 200, result.meta);
  } catch (e) { next(e); }
}

export async function markRiderNotifRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await notificationService.markRead(req.rider!.riderId, req.params['id']!);
    sendSuccess(res, null, 'Notification marked as read');
  } catch (e) { next(e); }
}

export async function markAllRiderNotifsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await notificationService.markAllRead(NotificationReceiverType.RIDER, req.rider!.riderId);
    sendSuccess(res, null, 'All notifications marked as read');
  } catch (e) { next(e); }
}
