import { prisma } from '../config/database';
import { OrderStatus } from '@prisma/client';

export const analyticsRepository = {
  // ─── Store Analytics ────────────────────────────────────────────────────────

  async storeSummary(storeId: string) {
    const [totalOrders, pendingOrders, totalRevenue, totalRiders] = await prisma.$transaction([
      prisma.order.count({ where: { storeId } }),
      prisma.order.count({ where: { storeId, status: { in: ['PLACED', 'ACCEPTED', 'PREPARING'] } } }),
      prisma.order.aggregate({
        where: { storeId, status: 'DELIVERED' },
        _sum: { totalPkr: true },
      }),
      prisma.rider.count({ where: { storeId } }),
    ]);
    return { totalOrders, pendingOrders, totalRevenue: totalRevenue._sum.totalPkr ?? 0, totalRiders };
  },

  async storeSalesOverview(storeId: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return prisma.order.groupBy({
      by: ['status'],
      where: { storeId, createdAt: { gte: thirtyDaysAgo } },
      _count: { id: true },
      _sum: { totalPkr: true },
    });
  },

  async storeTopProducts(storeId: string, take = 10) {
    // Top store products by quantity sold
    return prisma.orderItem.groupBy({
      by: ['storeProductId', 'menuItemId'],
      where: { order: { storeId, status: 'DELIVERED' } },
      _sum: { quantity: true, totalPkr: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take,
    });
  },

  async storeRevenueTrend(storeId: string, days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    // Raw daily totals via prisma.$queryRaw
    return prisma.$queryRaw<{ date: Date; total: number }[]>`
      SELECT DATE("createdAt") as date, SUM("totalPkr") as total
      FROM "Order"
      WHERE "storeId" = ${storeId}
        AND status = 'DELIVERED'
        AND "createdAt" >= ${since}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `;
  },

  // ─── Rider Analytics ───────────────────────────────────────────────────────

  async riderEarningsSummary(riderId: string) {
    const [total, thisMonth] = await prisma.$transaction([
      prisma.order.aggregate({
        where: { riderId, status: 'DELIVERED' },
        _sum: { deliveryFeePkr: true },
        _count: { id: true },
      }),
      prisma.order.aggregate({
        where: {
          riderId,
          status: 'DELIVERED',
          createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
        },
        _sum: { deliveryFeePkr: true },
      }),
    ]);
    return {
      totalDeliveries: total._count.id,
      totalEarnings: total._sum.deliveryFeePkr ?? 0,
      thisMonthEarnings: thisMonth._sum.deliveryFeePkr ?? 0,
    };
  },

  async riderEarningsHistory(riderId: string, skip: number, take: number) {
    const where = { riderId, status: OrderStatus.DELIVERED };
    const [orders, total] = await prisma.$transaction([
      prisma.order.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          deliveryFeePkr: true,
          totalPkr: true,
          createdAt: true,
          store: { select: { id: true, name: true } },
          address: { select: { city: true, street: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where }),
    ]);
    return { orders, total };
  },

  async riderPerformance(riderId: string) {
    const [total, delivered, cancelled] = await prisma.$transaction([
      prisma.order.count({ where: { riderId } }),
      prisma.order.count({ where: { riderId, status: 'DELIVERED' } }),
      prisma.order.count({ where: { riderId, status: 'CANCELLED' } }),
    ]);
    const successRate = total > 0 ? ((delivered / total) * 100).toFixed(1) : '0';
    return { total, delivered, cancelled, successRate: `${successRate}%` };
  },
};
