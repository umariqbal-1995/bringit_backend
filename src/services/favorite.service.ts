import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';
import { buildMeta } from '../utils/pagination';

export const favoriteService = {
  async getFavorites(userId: string, page: number, limit: number, skip: number) {
    const where = { userId };
    const [favorites, total] = await prisma.$transaction([
      prisma.favorite.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          createdAt: true,
          store: {
            select: {
              id: true, name: true, slug: true, type: true,
              subType: true, logoUrl: true, city: true,
              isOpen: true, deliveryFeePkr: true, deliveryRadiusKm: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.favorite.count({ where }),
    ]);
    return { favorites, meta: buildMeta(page, limit, total) };
  },

  async addFavorite(userId: string, storeId: string) {
    // Verify store exists
    const store = await prisma.store.findUnique({ where: { id: storeId }, select: { id: true } });
    if (!store) throw new AppError('Store not found', 404);

    try {
      return await prisma.favorite.create({
        data: { userId, storeId },
        select: { id: true, userId: true, storeId: true, createdAt: true },
      });
    } catch {
      throw new AppError('Store already in favorites', 409);
    }
  },

  async removeFavorite(userId: string, storeId: string) {
    const result = await prisma.favorite.deleteMany({ where: { userId, storeId } });
    if (result.count === 0) throw new AppError('Favorite not found', 404);
  },
};
