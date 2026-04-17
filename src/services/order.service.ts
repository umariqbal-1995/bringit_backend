/**
 * Order Service
 *
 * Handles order lifecycle: PLACED → ACCEPTED → PREPARING → OUT_FOR_DELIVERY → DELIVERED
 * All pricing calculated server-side — client totals are ignored.
 */

import { Decimal } from '@prisma/client/runtime/library';
import { prisma } from '../config/database';
import { orderRepository } from '../repositories/order.repository';
import { storeRepository } from '../repositories/store.repository';
import { riderRepository } from '../repositories/rider.repository';
import { riderAssignmentService } from './rider-assignment.service';
import { notificationService } from './notification.service';
import { AppError } from '../middlewares/error.middleware';
import { buildMeta } from '../utils/pagination';
import { PlaceOrderDto, CancelOrderDto, AcceptOrderDto } from '../dtos/order.dto';
import { OrderStatus } from '@prisma/client';

/** Fetch FCM token for a user/store/rider without throwing */
async function getFcmToken(type: 'user' | 'store' | 'rider', id: string): Promise<string | null> {
  try {
    if (type === 'user') {
      const r = await prisma.user.findUnique({ where: { id }, select: { fcmToken: true } });
      return r?.fcmToken ?? null;
    }
    if (type === 'store') {
      const r = await prisma.store.findUnique({ where: { id }, select: { fcmToken: true } });
      return r?.fcmToken ?? null;
    }
    const r = await prisma.rider.findUnique({ where: { id }, select: { fcmToken: true } });
    return r?.fcmToken ?? null;
  } catch {
    return null;
  }
}

export const orderService = {
  // ─── Place Order ──────────────────────────────────────────────────────────

  async placeOrder(customerId: string, dto: PlaceOrderDto) {
    const store = await storeRepository.findById(dto.storeId);
    if (!store) throw new AppError('Store not found', 404);
    if (!store.isOpen) throw new AppError('Store is currently closed', 400);

    // ── Fetch prices from DB (never trust client) ──────────────────────────
    let subtotal = 0;

    const itemsData: {
      storeProductId?: string;
      menuItemId?: string;
      quantity: number;
      unitPricePkr: Decimal;
      totalPkr: Decimal;
    }[] = [];

    for (const item of dto.items) {
      if (item.storeProductId) {
        const sp = await prisma.storeProduct.findUnique({
          where: { id: item.storeProductId },
          select: { pricePkr: true, isActive: true, storeId: true },
        });
        if (!sp || !sp.isActive) throw new AppError(`Product ${item.storeProductId} not available`, 400);
        if (sp.storeId !== dto.storeId) throw new AppError(`Product does not belong to this store`, 400);
        const lineTotal = Number(sp.pricePkr) * item.quantity;
        subtotal += lineTotal;
        itemsData.push({
          storeProductId: item.storeProductId,
          quantity: item.quantity,
          unitPricePkr: sp.pricePkr,
          totalPkr: new Decimal(lineTotal),
        });
      } else if (item.menuItemId) {
        const mi = await prisma.menuItem.findUnique({
          where: { id: item.menuItemId },
          select: { pricePkr: true, isActive: true, storeId: true },
        });
        if (!mi || !mi.isActive) throw new AppError(`Menu item ${item.menuItemId} not available`, 400);
        if (mi.storeId !== dto.storeId) throw new AppError(`Menu item does not belong to this store`, 400);
        const lineTotal = Number(mi.pricePkr) * item.quantity;
        subtotal += lineTotal;
        itemsData.push({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          unitPricePkr: mi.pricePkr,
          totalPkr: new Decimal(lineTotal),
        });
      }
    }

    const deliveryFee = Number(store.deliveryFeePkr);
    const total = subtotal + deliveryFee;

    // ── Create order in a transaction ──────────────────────────────────────
    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          customerId,
          storeId: dto.storeId,
          addressId: dto.addressId,
          paymentMethod: dto.paymentMethod,
          subtotalPkr: new Decimal(subtotal),
          deliveryFeePkr: new Decimal(deliveryFee),
          totalPkr: new Decimal(total),
          status: 'PLACED',
          items: {
            create: itemsData,
          },
        },
        select: { id: true, status: true, totalPkr: true, deliveryFeePkr: true, subtotalPkr: true },
      });
      return created;
    });

    const placed = await orderRepository.findById(order.id);

    // Notify store of new order (fire-and-forget)
    const storeFcm = await getFcmToken('store', dto.storeId);
    void notificationService.createAndPush({
      receiverType: 'STORE',
      receiverId: dto.storeId,
      fcmToken: storeFcm,
      title: '🛍️ New Order',
      body: `You have a new order of Rs ${total.toFixed(0)}`,
      data: { type: 'order', orderId: order.id, action: 'PLACED' },
    });

    return placed;
  },

  // ─── Customer: List Orders ────────────────────────────────────────────────

  async getCustomerOrders(customerId: string, page: number, limit: number, skip: number) {
    const { orders, total } = await orderRepository.findByCustomer(customerId, skip, limit);
    return { orders, meta: buildMeta(page, limit, total) };
  },

  async getCustomerOrder(customerId: string, orderId: string) {
    const order = await orderRepository.findById(orderId);
    if (!order || order.customer.id !== customerId) throw new AppError('Order not found', 404);
    return order;
  },

  async cancelOrderByCustomer(customerId: string, orderId: string, dto: CancelOrderDto) {
    const order = await orderRepository.findByIdRaw(orderId);
    if (!order || order.customerId !== customerId) throw new AppError('Order not found', 404);
    if (!['PLACED', 'ACCEPTED'].includes(order.status)) {
      throw new AppError('Order cannot be cancelled at this stage', 400);
    }
    const updated = await orderRepository.updateStatus(orderId, 'CANCELLED', { cancelReason: dto.reason });

    // Notify store of cancellation
    const storeFcm = await getFcmToken('store', order.storeId);
    void notificationService.createAndPush({
      receiverType: 'STORE',
      receiverId: order.storeId,
      fcmToken: storeFcm,
      title: '❌ Order Cancelled',
      body: 'A customer cancelled their order.',
      data: { type: 'order', orderId, action: 'CANCELLED' },
    });

    return updated;
  },

  // ─── Store: Order Management ──────────────────────────────────────────────

  async getStoreOrders(storeId: string, page: number, limit: number, skip: number, status?: OrderStatus) {
    const { orders, total } = await orderRepository.findByStore(storeId, skip, limit, status);
    return { orders, meta: buildMeta(page, limit, total) };
  },

  async getStoreOrder(storeId: string, orderId: string) {
    const order = await orderRepository.findById(orderId);
    if (!order || order.store.id !== storeId) throw new AppError('Order not found', 404);
    return order;
  },

  async acceptOrder(storeId: string, orderId: string, dto: AcceptOrderDto) {
    const order = await orderRepository.findByIdRaw(orderId);
    if (!order || order.storeId !== storeId) throw new AppError('Order not found', 404);
    if (order.status !== 'PLACED') throw new AppError('Order cannot be accepted at this stage', 400);

    let assignedRiderId: string | null = null;

    if (dto.riderId) {
      // Manual assignment
      assignedRiderId = await riderAssignmentService.manualAssign(orderId, storeId, dto.riderId);
    } else {
      // Auto assignment
      assignedRiderId = await riderAssignmentService.autoAssign(orderId, storeId);
      if (!assignedRiderId) {
        // Keep ACCEPTED but unassigned — schedule retry
        await orderRepository.updateStatus(orderId, 'ACCEPTED');
        riderAssignmentService.scheduleRetry(orderId, storeId);
      }
    }

    const accepted = await orderRepository.findById(orderId);

    // Notify user order was accepted
    const userFcm = await getFcmToken('user', order.customerId);
    void notificationService.createAndPush({
      receiverType: 'USER',
      receiverId: order.customerId,
      fcmToken: userFcm,
      title: '✅ Order Accepted',
      body: 'Your order has been accepted and is being prepared.',
      data: { type: 'order', orderId, action: 'ACCEPTED' },
    });

    // Notify assigned rider if one was assigned
    if (assignedRiderId) {
      const riderFcm = await getFcmToken('rider', assignedRiderId);
      void notificationService.createAndPush({
        receiverType: 'RIDER',
        receiverId: assignedRiderId,
        fcmToken: riderFcm,
        title: '🛵 New Delivery',
        body: 'You have been assigned a new delivery.',
        data: { type: 'order', orderId, action: 'ASSIGNED' },
      });
    }

    return accepted;
  },

  async rejectOrder(storeId: string, orderId: string, reason: string) {
    const order = await orderRepository.findByIdRaw(orderId);
    if (!order || order.storeId !== storeId) throw new AppError('Order not found', 404);
    if (order.status !== 'PLACED') throw new AppError('Order cannot be rejected at this stage', 400);
    const updated = await orderRepository.updateStatus(orderId, 'CANCELLED', { cancelReason: reason });

    // Notify user their order was rejected
    const userFcm = await getFcmToken('user', order.customerId);
    void notificationService.createAndPush({
      receiverType: 'USER',
      receiverId: order.customerId,
      fcmToken: userFcm,
      title: '❌ Order Not Accepted',
      body: `Your order was not accepted. Reason: ${reason}`,
      data: { type: 'order', orderId, action: 'REJECTED' },
    });

    return updated;
  },

  async markPreparing(storeId: string, orderId: string, riderId?: string) {
    const order = await orderRepository.findByIdRaw(orderId);
    if (!order || order.storeId !== storeId) throw new AppError('Order not found', 404);
    if (order.status !== 'ACCEPTED') throw new AppError('Order must be ACCEPTED before PREPARING', 400);

    // Assign rider if provided and not already assigned
    if (riderId && !order.riderId) {
      await riderAssignmentService.manualAssign(orderId, storeId, riderId);
    }

    // Re-check after potential assignment
    const updated = await orderRepository.findByIdRaw(orderId);
    if (!updated?.riderId) throw new AppError('A rider must be assigned before marking the order as preparing', 400);

    return orderRepository.updateStatus(orderId, 'PREPARING');
  },

  async markReady(storeId: string, orderId: string) {
    const order = await orderRepository.findByIdRaw(orderId);
    if (!order || order.storeId !== storeId) throw new AppError('Order not found', 404);
    if (order.status !== 'PREPARING') throw new AppError('Order must be PREPARING before marking ready', 400);
    // Mark ready stays as PREPARING — rider picks up next
    return orderRepository.findById(orderId);
  },

  // ─── Rider: Order Actions ─────────────────────────────────────────────────

  async getAssignedOrders(riderId: string, page: number, limit: number, skip: number) {
    const { orders, total } = await orderRepository.findByRider(riderId, skip, limit);
    return { orders, meta: buildMeta(page, limit, total) };
  },

  async getRiderOrder(riderId: string, orderId: string) {
    const order = await orderRepository.findById(orderId);
    if (!order || order.rider?.id !== riderId) throw new AppError('Order not found', 404);
    return order;
  },

  async pickupOrder(riderId: string, orderId: string) {
    const order = await orderRepository.findByIdRaw(orderId);
    if (!order || order.riderId !== riderId) throw new AppError('Order not found', 404);
    if (order.status !== 'PREPARING') throw new AppError('Order must be PREPARING before pickup', 400);
    const updated = await orderRepository.updateStatus(orderId, 'OUT_FOR_DELIVERY');

    // Notify user rider is on the way
    const userFcm = await getFcmToken('user', order.customerId);
    void notificationService.createAndPush({
      receiverType: 'USER',
      receiverId: order.customerId,
      fcmToken: userFcm,
      title: '🛵 On the Way!',
      body: 'Your order has been picked up and is on the way to you.',
      data: { type: 'order', orderId, action: 'OUT_FOR_DELIVERY' },
    });

    return updated;
  },

  async startDelivery(riderId: string, orderId: string) {
    const order = await orderRepository.findByIdRaw(orderId);
    if (!order || order.riderId !== riderId) throw new AppError('Order not found', 404);
    if (order.status !== 'OUT_FOR_DELIVERY') throw new AppError('Order not out for delivery yet', 400);
    return orderRepository.findById(orderId);
  },

  async completeOrder(riderId: string, orderId: string) {
    const order = await orderRepository.findByIdRaw(orderId);
    if (!order || order.riderId !== riderId) throw new AppError('Order not found', 404);
    if (order.status !== 'OUT_FOR_DELIVERY') throw new AppError('Order must be OUT_FOR_DELIVERY to complete', 400);

    const updated = await orderRepository.updateStatus(orderId, 'DELIVERED');
    // Free up the rider
    await riderRepository.updateAvailability(riderId, true);

    // Notify user order delivered
    const userFcm = await getFcmToken('user', order.customerId);
    void notificationService.createAndPush({
      receiverType: 'USER',
      receiverId: order.customerId,
      fcmToken: userFcm,
      title: '🎉 Order Delivered!',
      body: 'Your order has been delivered. Enjoy!',
      data: { type: 'order', orderId, action: 'DELIVERED' },
    });

    return updated;
  },

  async cancelOrderByRider(riderId: string, orderId: string, reason: string) {
    const order = await orderRepository.findByIdRaw(orderId);
    if (!order || order.riderId !== riderId) throw new AppError('Order not found', 404);
    if (!['ACCEPTED', 'PREPARING'].includes(order.status)) {
      throw new AppError('Order cannot be cancelled at this stage', 400);
    }
    const updated = await orderRepository.updateStatus(orderId, 'CANCELLED', { cancelReason: reason });
    // Make rider available again and re-run auto assignment
    await riderRepository.updateAvailability(riderId, true);
    riderAssignmentService.scheduleRetry(order.id, order.storeId);
    return updated;
  },
};
