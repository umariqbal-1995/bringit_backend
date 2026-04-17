import { NotificationReceiverType } from '@prisma/client';
import { notificationRepository } from '../repositories/notification.repository';
import { buildMeta } from '../utils/pagination';
import { admin, isFirebaseReady } from '../config/firebase';
import { logger } from '../utils/logger';

export const notificationService = {
  async getNotifications(
    receiverType: NotificationReceiverType,
    receiverId: string,
    page: number,
    limit: number,
    skip: number,
  ) {
    const { notifications, total } = await notificationRepository.findMany(
      receiverType,
      receiverId,
      skip,
      limit,
    );
    return { notifications, meta: buildMeta(page, limit, total) };
  },

  async markRead(receiverId: string, notifId: string) {
    return notificationRepository.markRead(notifId, receiverId);
  },

  async markAllRead(receiverType: NotificationReceiverType, receiverId: string) {
    return notificationRepository.markAllRead(receiverType, receiverId);
  },

  /** Send a raw FCM push to a single device token (fire-and-forget) */
  async sendPush(
    fcmToken: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<void> {
    if (!isFirebaseReady()) return;
    try {
      await admin.messaging().send({
        token: fcmToken,
        notification: { title, body },
        data: data ?? {},
        android: {
          priority: 'high',
          notification: { channelId: 'bringit_high_importance', sound: 'default' },
        },
        apns: {
          payload: { aps: { sound: 'default', badge: 1 } },
        },
      });
      logger.info(`FCM push sent to token ...${fcmToken.slice(-8)}`);
    } catch (err) {
      logger.warn('FCM push failed', { error: err, token: `...${fcmToken.slice(-8)}` });
    }
  },

  /** Create a DB notification record */
  async createNotification(data: {
    receiverType: NotificationReceiverType;
    receiverId: string;
    title: string;
    body?: string;
    data?: Record<string, unknown>;
  }) {
    return notificationRepository.create({
      receiverType: data.receiverType,
      receiverId: data.receiverId,
      title: data.title,
      body: data.body,
      ...(data.data ? { data: data.data as object } : {}),
    });
  },

  /**
   * Save notification to DB and send FCM push in one call.
   * Push failure never throws — notifications are fire-and-forget.
   */
  async createAndPush(options: {
    receiverType: NotificationReceiverType;
    receiverId: string;
    fcmToken?: string | null;
    title: string;
    body?: string;
    data?: Record<string, string>;
  }): Promise<void> {
    // Always save to DB so in-app inbox is populated
    await this.createNotification({
      receiverType: options.receiverType,
      receiverId: options.receiverId,
      title: options.title,
      body: options.body,
      data: options.data,
    });

    // Send push if device token is available
    if (options.fcmToken) {
      void this.sendPush(
        options.fcmToken,
        options.title,
        options.body ?? '',
        options.data,
      );
    }
  },
};
