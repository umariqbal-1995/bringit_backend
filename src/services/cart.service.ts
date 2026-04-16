import { cartRepository } from '../repositories/cart.repository';
import { AppError } from '../middlewares/error.middleware';
import { AddCartItemDto, UpdateCartItemDto } from '../dtos/cart.dto';

export const cartService = {
  async getCart(userId: string, storeId: string) {
    const cart = await cartRepository.findCart(userId, storeId);
    if (!cart) return null;
    return cart;
  },

  async addItem(userId: string, storeId: string, dto: AddCartItemDto) {
    const cart = await cartRepository.getOrCreateCart(userId, storeId);
    return cartRepository.addCartItem(cart.id, dto);
  },

  async updateItem(userId: string, storeId: string, itemId: string, dto: UpdateCartItemDto) {
    const cart = await cartRepository.findCart(userId, storeId);
    if (!cart) throw new AppError('Cart not found', 404);

    const item = await cartRepository.findCartItem(cart.id, itemId);
    if (!item) throw new AppError('Cart item not found', 404);

    await cartRepository.updateCartItem(cart.id, itemId, dto.quantity);
    return cartRepository.findCart(userId, storeId);
  },

  async deleteItem(userId: string, storeId: string, itemId: string) {
    const cart = await cartRepository.findCart(userId, storeId);
    if (!cart) throw new AppError('Cart not found', 404);

    const result = await cartRepository.deleteCartItem(cart.id, itemId);
    if (result.count === 0) throw new AppError('Cart item not found', 404);
  },

  async clearCart(userId: string, storeId: string) {
    const cart = await cartRepository.findCart(userId, storeId);
    if (!cart) throw new AppError('Cart not found', 404);
    await cartRepository.clearCart(cart.id);
  },
};
