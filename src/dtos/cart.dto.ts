import { z } from 'zod';

export const AddCartItemSchema = z
  .object({
    storeProductId: z.string().cuid().optional(),
    menuItemId: z.string().cuid().optional(),
    quantity: z.number().int().min(1).max(99),
  })
  .refine((d) => d.storeProductId ?? d.menuItemId, {
    message: 'Either storeProductId or menuItemId is required',
  });

export const UpdateCartItemSchema = z.object({
  quantity: z.number().int().min(1).max(99),
});

export type AddCartItemDto = z.infer<typeof AddCartItemSchema>;
export type UpdateCartItemDto = z.infer<typeof UpdateCartItemSchema>;
