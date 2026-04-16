import { prisma } from '../config/database';

const cartItemSelect = {
  id: true,
  quantity: true,
  storeProductId: true,
  menuItemId: true,
  storeProduct: {
    select: {
      id: true,
      pricePkr: true,
      product: { select: { id: true, name: true, imageUrl: true } },
    },
  },
  menuItem: {
    select: { id: true, name: true, pricePkr: true, imageUrl: true },
  },
};

export const cartRepository = {
  async findCart(userId: string, storeId: string) {
    return prisma.cart.findUnique({
      where: { userId_storeId: { userId, storeId } },
      select: {
        id: true,
        userId: true,
        storeId: true,
        createdAt: true,
        items: { select: cartItemSelect },
      },
    });
  },

  async findCartById(cartId: string) {
    return prisma.cart.findUnique({
      where: { id: cartId },
      select: {
        id: true,
        userId: true,
        storeId: true,
        createdAt: true,
        items: { select: cartItemSelect },
      },
    });
  },

  async getOrCreateCart(userId: string, storeId: string) {
    return prisma.cart.upsert({
      where: { userId_storeId: { userId, storeId } },
      create: { userId, storeId },
      update: {},
      select: {
        id: true,
        userId: true,
        storeId: true,
        createdAt: true,
        items: { select: cartItemSelect },
      },
    });
  },

  async findCartItem(cartId: string, itemId: string) {
    return prisma.cartItem.findFirst({
      where: { id: itemId, cartId },
      select: { id: true, cartId: true, quantity: true, storeProductId: true, menuItemId: true },
    });
  },

  async addCartItem(
    cartId: string,
    data: {
      storeProductId?: string;
      menuItemId?: string;
      quantity: number;
    },
  ) {
    // Check if same item already in cart
    const existing = await prisma.cartItem.findFirst({
      where: {
        cartId,
        storeProductId: data.storeProductId ?? undefined,
        menuItemId: data.menuItemId ?? undefined,
      },
    });

    if (existing) {
      return prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + data.quantity },
        select: cartItemSelect,
      });
    }

    return prisma.cartItem.create({
      data: { cartId, ...data },
      select: cartItemSelect,
    });
  },

  async updateCartItem(cartId: string, itemId: string, quantity: number) {
    return prisma.cartItem.updateMany({
      where: { id: itemId, cartId },
      data: { quantity },
    });
  },

  async deleteCartItem(cartId: string, itemId: string) {
    return prisma.cartItem.deleteMany({ where: { id: itemId, cartId } });
  },

  async clearCart(cartId: string) {
    await prisma.cartItem.deleteMany({ where: { cartId } });
    await prisma.cart.delete({ where: { id: cartId } });
  },
};
