import { z } from 'zod';
import { StoreType, StoreStatus } from '@prisma/client';

export const UpdateStoreProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
  type: z.nativeEnum(StoreType).optional(),
  status: z.nativeEnum(StoreStatus).optional(),
  subType: z.string().max(50).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  addressLine: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  deliveryRadiusKm: z.number().positive().max(100).optional(),
  deliveryFeePkr: z.number().nonnegative().optional(),
  logoUrl: z.string().url().optional(),
  bannerUrls: z.array(z.string().url()).optional(),
  idCardFrontUrl: z.string().url().optional(),
  idCardBackUrl: z.string().url().optional(),
  fcmToken: z.string().optional(),
});

export const UpdateStoreStatusSchema = z.object({
  isOpen: z.boolean(),
});

export const CreateStoreProductSchema = z.object({
  productId: z.string().cuid(),
  pricePkr: z.number().positive(),
});

export const UpdateStoreProductSchema = z.object({
  pricePkr: z.number().positive().optional(),
  isActive: z.boolean().optional(),
});

export const CreateMenuItemSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  imageUrl: z.string().url().optional(),
  category: z.string().max(50).optional(),
  pricePkr: z.number().positive(),
  isActive: z.boolean().default(true),
});

export const UpdateMenuItemSchema = CreateMenuItemSchema.partial();

export const CreateRiderSchema = z.object({
  phone: z.string().regex(/^\+?[0-9]{10,15}$/, 'Invalid phone number'),
  name: z.string().min(2).max(100).optional(),
});

export const UpdateRiderSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  isAvailable: z.boolean().optional(),
});

export type UpdateStoreProfileDto = z.infer<typeof UpdateStoreProfileSchema>;
export type UpdateStoreStatusDto = z.infer<typeof UpdateStoreStatusSchema>;
export type CreateStoreProductDto = z.infer<typeof CreateStoreProductSchema>;
export type UpdateStoreProductDto = z.infer<typeof UpdateStoreProductSchema>;
export type CreateMenuItemDto = z.infer<typeof CreateMenuItemSchema>;
export type UpdateMenuItemDto = z.infer<typeof UpdateMenuItemSchema>;
export type CreateRiderDto = z.infer<typeof CreateRiderSchema>;
export type UpdateRiderDto = z.infer<typeof UpdateRiderSchema>;
