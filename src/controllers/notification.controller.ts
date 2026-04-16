import { Request, Response, NextFunction } from 'express';
import { NotificationReceiverType } from '@prisma/client';
import { notificationService } from '../services/notification.service';
import { sendSuccess } from '../utils/response';
import { parsePagination } from '../utils/pagination';
import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';

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

export async function updateUserFcmToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { fcmToken } = req.body as { fcmToken: string };
    if (!fcmToken) throw new AppError('fcmToken is required', 400);
    await prisma.user.update({ where: { id: req.user!.userId }, data: { fcmToken } });
    sendSuccess(res, null, 'FCM token updated');
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

export async function updateStoreFcmToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { fcmToken } = req.body as { fcmToken: string };
    if (!fcmToken) throw new AppError('fcmToken is required', 400);
    await prisma.store.update({ where: { id: req.store!.storeId }, data: { fcmToken } });
    sendSuccess(res, null, 'FCM token updated');
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

export async function updateRiderFcmToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { fcmToken } = req.body as { fcmToken: string };
    if (!fcmToken) throw new AppError('fcmToken is required', 400);
    await prisma.rider.update({ where: { id: req.rider!.riderId }, data: { fcmToken } });
    sendSuccess(res, null, 'FCM token updated');
  } catch (e) { next(e); }
}

// ─── Test Push (dev/admin use) ────────────────────────────────────────────────

export async function testPushNotification(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { fcmToken, title, body } = req.body as { fcmToken: string; title: string; body: string };
    if (!fcmToken) throw new AppError('fcmToken is required', 400);
    await notificationService.sendPush(fcmToken, title ?? 'Test', body ?? 'Push notification is working!');
    sendSuccess(res, null, 'Test push sent');
  } catch (e) { next(e); }
}
