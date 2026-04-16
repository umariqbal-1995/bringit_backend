import { Prisma, NotificationReceiverType } from '@prisma/client';
import { prisma } from '../config/database';

const notifSelect = {
  id: true,
  receiverType: true,
  receiverId: true,
  title: true,
  body: true,
  data: true,
  read: true,
  createdAt: true,
} satisfies Prisma.NotificationSelect;

export const notificationRepository = {
  async create(data: Prisma.NotificationUncheckedCreateInput) {
    return prisma.notification.create({ data, select: notifSelect });
  },

  async findMany(
    receiverType: NotificationReceiverType,
    receiverId: string,
    skip: number,
    take: number,
  ) {
    const where: Prisma.NotificationWhereInput = { receiverType, receiverId };
    const [notifications, total] = await prisma.$transaction([
      prisma.notification.findMany({
        where,
        skip,
        take,
        select: notifSelect,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where }),
    ]);
    return { notifications, total };
  },

  async markRead(id: string, receiverId: string) {
    return prisma.notification.updateMany({
      where: { id, receiverId },
      data: { read: true },
    });
  },

  async markAllRead(receiverType: NotificationReceiverType, receiverId: string) {
    return prisma.notification.updateMany({
      where: { receiverType, receiverId, read: false },
      data: { read: true },
    });
  },
};
