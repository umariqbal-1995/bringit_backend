import { Prisma, User, Address } from '@prisma/client';
import { prisma } from '../config/database';

// ─── User Selects (avoid over-fetching) ──────────────────────────────────────
const userSelect = {
  id: true,
  role: true,
  phone: true,
  name: true,
  avatarUrl: true,
  fcmToken: true,
  isActive: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

const addressSelect = {
  id: true,
  userId: true,
  label: true,
  street: true,
  city: true,
  state: true,
  latitude: true,
  longitude: true,
  createdAt: true,
} satisfies Prisma.AddressSelect;

export const userRepository = {
  async findByPhone(phone: string) {
    return prisma.user.findUnique({ where: { phone }, select: userSelect });
  },

  async findById(id: string) {
    return prisma.user.findUnique({ where: { id }, select: userSelect });
  },

  async upsertByPhone(phone: string): Promise<typeof userSelect extends Prisma.UserSelect ? Prisma.UserGetPayload<{ select: typeof userSelect }> : never> {
    return prisma.user.upsert({
      where: { phone },
      create: { phone, role: 'CUSTOMER' },
      update: {},
      select: userSelect,
    }) as Promise<Prisma.UserGetPayload<{ select: typeof userSelect }>>;
  },

  async update(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({ where: { id }, data, select: userSelect });
  },

  // ─── Addresses ─────────────────────────────────────────────────────────────
  async getAddresses(userId: string) {
    return prisma.address.findMany({
      where: { userId },
      select: addressSelect,
      orderBy: { createdAt: 'desc' },
    });
  },

  async findAddress(id: string, userId: string) {
    return prisma.address.findFirst({ where: { id, userId }, select: addressSelect });
  },

  async createAddress(userId: string, data: Prisma.AddressUncheckedCreateInput) {
    return prisma.address.create({
      data: { ...data, userId },
      select: addressSelect,
    });
  },

  async updateAddress(id: string, userId: string, data: Prisma.AddressUpdateInput) {
    return prisma.address.updateMany({
      where: { id, userId },
      data,
    });
  },

  async deleteAddress(id: string, userId: string) {
    return prisma.address.deleteMany({ where: { id, userId } });
  },
};
