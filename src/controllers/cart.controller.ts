import { Request, Response, NextFunction } from 'express';
import { cartService } from '../services/cart.service';
import { sendSuccess, sendCreated } from '../utils/response';
import { AddCartItemDto, UpdateCartItemDto } from '../dtos/cart.dto';

export async function getCart(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const cart = await cartService.getCart(req.user!.userId, req.params['storeId']!);
    sendSuccess(res, cart);
  } catch (e) { next(e); }
}

export async function addCartItem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const item = await cartService.addItem(
      req.user!.userId, req.params['storeId']!, req.body as AddCartItemDto,
    );
    sendCreated(res, item, 'Item added to cart');
  } catch (e) { next(e); }
}

export async function updateCartItem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const cart = await cartService.updateItem(
      req.user!.userId, req.params['storeId']!, req.params['itemId']!, req.body as UpdateCartItemDto,
    );
    sendSuccess(res, cart, 'Cart item updated');
  } catch (e) { next(e); }
}

export async function deleteCartItem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await cartService.deleteItem(req.user!.userId, req.params['storeId']!, req.params['itemId']!);
    sendSuccess(res, null, 'Item removed from cart');
  } catch (e) { next(e); }
}

export async function clearCart(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await cartService.clearCart(req.user!.userId, req.params['storeId']!);
    sendSuccess(res, null, 'Cart cleared');
  } catch (e) { next(e); }
}
