import { Request, Response, NextFunction } from 'express';
import { OrderStatus } from '@prisma/client';
import { orderService } from '../services/order.service';
import { sendSuccess, sendCreated } from '../utils/response';
import { parsePagination } from '../utils/pagination';
import { PlaceOrderDto, CancelOrderDto, AcceptOrderDto, RejectOrderDto } from '../dtos/order.dto';

// ─── Customer ─────────────────────────────────────────────────────────────────

export async function placeOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const order = await orderService.placeOrder(req.user!.userId, req.body as PlaceOrderDto);
    sendCreated(res, order, 'Order placed successfully');
  } catch (e) { next(e); }
}

export async function getMyOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page, limit, skip } = parsePagination(req);
    const result = await orderService.getCustomerOrders(req.user!.userId, page, limit, skip);
    sendSuccess(res, result.orders, undefined, 200, result.meta);
  } catch (e) { next(e); }
}

export async function getMyOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const order = await orderService.getCustomerOrder(req.user!.userId, req.params['id']!);
    sendSuccess(res, order);
  } catch (e) { next(e); }
}

export async function cancelMyOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const order = await orderService.cancelOrderByCustomer(
      req.user!.userId, req.params['id']!, req.body as CancelOrderDto,
    );
    sendSuccess(res, order, 'Order cancelled');
  } catch (e) { next(e); }
}

// ─── Store ────────────────────────────────────────────────────────────────────

export async function getStoreOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page, limit, skip } = parsePagination(req);
    const status = req.query['status'] as OrderStatus | undefined;
    const result = await orderService.getStoreOrders(req.store!.storeId, page, limit, skip, status);
    sendSuccess(res, result.orders, undefined, 200, result.meta);
  } catch (e) { next(e); }
}

export async function getStoreOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const order = await orderService.getStoreOrder(req.store!.storeId, req.params['id']!);
    sendSuccess(res, order);
  } catch (e) { next(e); }
}

export async function acceptOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const order = await orderService.acceptOrder(
      req.store!.storeId, req.params['id']!, req.body as AcceptOrderDto,
    );
    sendSuccess(res, order, 'Order accepted');
  } catch (e) { next(e); }
}

export async function rejectOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { reason } = req.body as RejectOrderDto;
    const order = await orderService.rejectOrder(req.store!.storeId, req.params['id']!, reason);
    sendSuccess(res, order, 'Order rejected');
  } catch (e) { next(e); }
}

export async function markPreparing(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { riderId } = req.body as { riderId?: string };
    const order = await orderService.markPreparing(req.store!.storeId, req.params['id']!, riderId);
    sendSuccess(res, order, 'Order is now being prepared');
  } catch (e) {
    console.log(e);
    next(e);
   }
}

export async function markReady(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const order = await orderService.markReady(req.store!.storeId, req.params['id']!);
    sendSuccess(res, order, 'Order marked as ready');
  } catch (e) { next(e); }
}

// ─── Rider ────────────────────────────────────────────────────────────────────

export async function getAssignedOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page, limit, skip } = parsePagination(req);
    const result = await orderService.getAssignedOrders(req.rider!.riderId, page, limit, skip);
    sendSuccess(res, result.orders, undefined, 200, result.meta);
  } catch (e) { next(e); }
}

export async function getRiderOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const order = await orderService.getRiderOrder(req.rider!.riderId, req.params['id']!);
    sendSuccess(res, order);
  } catch (e) { next(e); }
}

export async function pickupOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const order = await orderService.pickupOrder(req.rider!.riderId, req.params['id']!);
    sendSuccess(res, order, 'Order picked up');
  } catch (e) { next(e); }
}

export async function startDelivery(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const order = await orderService.startDelivery(req.rider!.riderId, req.params['id']!);
    sendSuccess(res, order, 'Delivery started');
  } catch (e) { next(e); }
}

export async function completeOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const order = await orderService.completeOrder(req.rider!.riderId, req.params['id']!);
    sendSuccess(res, order, 'Order delivered successfully');
  } catch (e) { next(e); }
}

export async function riderCancelOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { reason } = req.body as { reason: string };
    const order = await orderService.cancelOrderByRider(req.rider!.riderId, req.params['id']!, reason);
    sendSuccess(res, order, 'Order cancelled');
  } catch (e) { next(e); }
}
