import { Prisma, StoreType, StoreStatus } from '@prisma/client';
import { prisma } from '../config/database';

const storeSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  type: true,
  subType: true,
  status: true,
  isOpen: true,
  latitude: true,
  longitude: true,
  addressLine: true,
  city: true,
  deliveryRadiusKm: true,
  deliveryFeePkr: true,
  logoUrl: true,
  bannerUrls: true,
  idCardFrontUrl: true,
  idCardBackUrl: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.StoreSelect;

const storeWithPhoneSelect = { ...storeSelect, phone: true } satisfies Prisma.StoreSelect;

export const storeRepository = {
  async findByPhone(phone: string) {
    return prisma.store.findUnique({ where: { phone }, select: storeWithPhoneSelect });
  },

  async findById(id: string) {
    return prisma.store.findUnique({ where: { id }, select: storeSelect });
  },

  async findByIdWithPhone(id: string) {
    return prisma.store.findUnique({ where: { id }, select: storeWithPhoneSelect });
  },

  async createStub(phone: string) {
    const slug = `store-${phone.replace(/\D/g, '')}-${Date.now()}`;
    return prisma.store.create({
      data: {
        phone,
        name: 'My Store',
        slug,
        type: StoreType.RESTAURANT,
        status: StoreStatus.PENDING,
        latitude: 0,
        longitude: 0,
        addressLine: '',
        city: '',
        deliveryRadiusKm: 5,
        deliveryFeePkr: 0,
      },
      select: storeWithPhoneSelect,
    });
  },

  async update(id: string, data: Prisma.StoreUpdateInput) {
    return prisma.store.update({ where: { id }, data, select: storeSelect });
  },

  // ─── Listings ──────────────────────────────────────────────────────────────
  async listStores(
    type: StoreType,
    skip: number,
    take: number,
  ) {
    const where: Prisma.StoreWhereInput = {
      type,
      status: StoreStatus.ACTIVE,
    };
    const [stores, total] = await prisma.$transaction([
      prisma.store.findMany({ where, skip, take, select: storeSelect, orderBy: { name: 'asc' } }),
      prisma.store.count({ where }),
    ]);
    return { stores, total };
  },

  // ─── Products ──────────────────────────────────────────────────────────────
  async getStoreProducts(storeId: string, skip: number, take: number) {
    const where: Prisma.StoreProductWhereInput = { storeId, isActive: true };
    const [items, total] = await prisma.$transaction([
      prisma.storeProduct.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          pricePkr: true,
          isActive: true,
          createdAt: true,
          product: {
            select: {
              id: true, name: true, slug: true, category: true,
              brand: true, imageUrl: true, barcode: true,
            },
          },
        },
        orderBy: { product: { name: 'asc' } },
      }),
      prisma.storeProduct.count({ where }),
    ]);
    return { items, total };
  },

  async findStoreProduct(id: string, storeId: string) {
    return prisma.storeProduct.findFirst({
      where: { id, storeId },
      select: { id: true, storeId: true, productId: true, pricePkr: true, isActive: true },
    });
  },

  async createStoreProduct(storeId: string, data: { productId: string; pricePkr: number }) {
    return prisma.storeProduct.create({
      data: { storeId, ...data },
      select: { id: true, storeId: true, productId: true, pricePkr: true, isActive: true, createdAt: true },
    });
  },

  async updateStoreProduct(id: string, storeId: string, data: Prisma.StoreProductUpdateInput) {
    return prisma.storeProduct.updateMany({ where: { id, storeId }, data });
  },

  async deleteStoreProduct(id: string, storeId: string) {
    return prisma.storeProduct.updateMany({ where: { id, storeId }, data: { isActive: false } });
  },

  // ─── Menu Items ────────────────────────────────────────────────────────────
  async getMenuItems(storeId: string, skip: number, take: number) {
    const where: Prisma.MenuItemWhereInput = { storeId, isActive: true };
    const [items, total] = await prisma.$transaction([
      prisma.menuItem.findMany({
        where,
        skip,
        take,
        select: {
          id: true, name: true, description: true, imageUrl: true,
          category: true, pricePkr: true, isActive: true, createdAt: true,
        },
        orderBy: { name: 'asc' },
      }),
      prisma.menuItem.count({ where }),
    ]);
    return { items, total };
  },

  async findMenuItem(id: string, storeId: string) {
    return prisma.menuItem.findFirst({
      where: { id, storeId },
      select: {
        id: true, storeId: true, name: true, description: true,
        imageUrl: true, category: true, pricePkr: true, isActive: true,
      },
    });
  },

  async createMenuItem(storeId: string, data: Prisma.MenuItemUncheckedCreateInput) {
    return prisma.menuItem.create({ data: { ...data, storeId } });
  },

  async updateMenuItem(id: string, storeId: string, data: Prisma.MenuItemUpdateInput) {
    return prisma.menuItem.updateMany({ where: { id, storeId }, data });
  },

  async deleteMenuItem(id: string, storeId: string) {
    return prisma.menuItem.updateMany({ where: { id, storeId }, data: { isActive: false } });
  },
};
