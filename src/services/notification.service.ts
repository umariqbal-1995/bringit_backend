import { NotificationReceiverType } from '@prisma/client';
import { notificationRepository } from '../repositories/notification.repository';
import { buildMeta } from '../utils/pagination';

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

  /** Internal helper — create a notification record */
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
      // Prisma accepts plain objects for Json fields
      ...(data.data ? { data: data.data as object } : {}),
    });
  },
};
