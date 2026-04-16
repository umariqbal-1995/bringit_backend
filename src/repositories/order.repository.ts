import { Prisma, OrderStatus } from '@prisma/client';
import { prisma } from '../config/database';

const orderItemSelect = {
  id: true,
  quantity: true,
  unitPricePkr: true,
  totalPkr: true,
  storeProductId: true,
  menuItemId: true,
  storeProduct: {
    select: { id: true, product: { select: { id: true, name: true, imageUrl: true } } },
  },
  menuItem: { select: { id: true, name: true, imageUrl: true } },
} satisfies Prisma.OrderItemSelect;

const orderSelect = {
  id: true,
  status: true,
  paymentMethod: true,
  subtotalPkr: true,
  deliveryFeePkr: true,
  totalPkr: true,
  cancelReason: true,
  createdAt: true,
  updatedAt: true,
  customer: { select: { id: true, name: true, phone: true, avatarUrl: true } },
  store: { select: { id: true, name: true, slug: true, logoUrl: true, city: true, latitude: true, longitude: true } },
  rider: { select: { id: true, name: true, phone: true } },
  address: { select: { id: true, label: true, street: true, city: true, latitude: true, longitude: true } },
  items: { select: orderItemSelect },
} satisfies Prisma.OrderSelect;

export const orderRepository = {
  async create(data: Prisma.OrderUncheckedCreateInput) {
    return prisma.order.create({ data, select: orderSelect });
  },

  async findById(id: string) {
    return prisma.order.findUnique({ where: { id }, select: orderSelect });
  },

  async findByIdRaw(id: string) {
    return prisma.order.findUnique({ where: { id } });
  },

  // Customer orders
  async findByCustomer(customerId: string, skip: number, take: number) {
    const where: Prisma.OrderWhereInput = { customerId };
    const [orders, total] = await prisma.$transaction([
      prisma.order.findMany({
        where, skip, take,
        select: orderSelect,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where }),
    ]);
    return { orders, total };
  },

  // Store orders
  async findByStore(
    storeId: string,
    skip: number,
    take: number,
    status?: OrderStatus,
  ) {
    const where: Prisma.OrderWhereInput = { storeId, ...(status ? { status } : {}) };
    const [orders, total] = await prisma.$transaction([
      prisma.order.findMany({
        where, skip, take,
        select: orderSelect,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where }),
    ]);
    return { orders, total };
  },

  // Rider orders
  async findByRider(riderId: string, skip: number, take: number, status?: OrderStatus) {
    const where: Prisma.OrderWhereInput = {
      riderId,
      ...(status ? { status } : { status: { in: ['ACCEPTED', 'PREPARING', 'OUT_FOR_DELIVERY'] } }),
    };
    const [orders, total] = await prisma.$transaction([
      prisma.order.findMany({
        where, skip, take,
        select: orderSelect,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where }),
    ]);
    return { orders, total };
  },

  async updateStatus(id: string, status: OrderStatus, extra?: Prisma.OrderUpdateInput) {
    return prisma.order.update({
      where: { id },
      data: { status, ...extra },
      select: orderSelect,
    });
  },

  async assignRider(id: string, riderId: string) {
    return prisma.order.update({
      where: { id },
      data: { riderId, status: 'ACCEPTED' },
      select: orderSelect,
    });
  },

  /** Count active orders for a rider (used in auto-assignment to find least busy rider) */
  async countActiveOrdersByRider(riderId: string): Promise<number> {
    return prisma.order.count({
      where: {
        riderId,
        status: { in: ['ACCEPTED', 'PREPARING', 'OUT_FOR_DELIVERY'] },
      },
    });
  },

  /** Available store riders */
  async findAvailableStoreRiders(storeId: string) {
    return prisma.rider.findMany({
      where: { storeId, isAvailable: true },
      select: { id: true, latitude: true, longitude: true },
    });
  },
};
