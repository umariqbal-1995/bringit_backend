import { Prisma } from '@prisma/client';
import { prisma } from '../config/database';

const riderSelect = {
  id: true,
  phone: true,
  name: true,
  storeId: true,
  isAvailable: true,
  latitude: true,
  longitude: true,
  lastLocationUpdatedAt: true,
  fcmToken: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.RiderSelect;

export const riderRepository = {
  async findByPhone(phone: string) {
    return prisma.rider.findUnique({ where: { phone }, select: riderSelect });
  },

  async findById(id: string) {
    return prisma.rider.findUnique({ where: { id }, select: riderSelect });
  },

  async create(data: Prisma.RiderUncheckedCreateInput) {
    return prisma.rider.create({ data, select: riderSelect });
  },

  async update(id: string, data: Prisma.RiderUpdateInput) {
    return prisma.rider.update({ where: { id }, data, select: riderSelect });
  },

  async updateAvailability(id: string, isAvailable: boolean) {
    return prisma.rider.update({
      where: { id },
      data: { isAvailable },
      select: { id: true, isAvailable: true },
    });
  },

  async updateLocation(id: string, latitude: number, longitude: number) {
    return prisma.rider.update({
      where: { id },
      data: { latitude, longitude, lastLocationUpdatedAt: new Date() },
      select: { id: true, latitude: true, longitude: true, lastLocationUpdatedAt: true },
    });
  },

  async findByStore(storeId: string) {
    return prisma.rider.findMany({
      where: { storeId },
      select: riderSelect,
      orderBy: { createdAt: 'desc' },
    });
  },

  async findAvailableRidersGlobal() {
    return prisma.rider.findMany({
      where: { isAvailable: true },
      select: { id: true, latitude: true, longitude: true },
    });
  },

  async deleteFromStore(id: string, storeId: string) {
    // Disassociate rider from store rather than hard delete
    return prisma.rider.updateMany({
      where: { id, storeId },
      data: { storeId: null },
    });
  },
};
