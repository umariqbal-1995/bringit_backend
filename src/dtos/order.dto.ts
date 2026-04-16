import { z } from 'zod';
import { PaymentMethod } from '@prisma/client';

export const PlaceOrderSchema = z.object({
  storeId: z.string().cuid(),
  addressId: z.string().cuid(),
  paymentMethod: z.nativeEnum(PaymentMethod),
  items: z
    .array(
      z
        .object({
          storeProductId: z.string().cuid().optional(),
          menuItemId: z.string().cuid().optional(),
          quantity: z.number().int().min(1).max(99),
        })
        .refine((d) => d.storeProductId ?? d.menuItemId, {
          message: 'Either storeProductId or menuItemId is required per item',
        }),
    )
    .min(1, 'Order must have at least one item'),
});

export const CancelOrderSchema = z.object({
  reason: z.string().min(5).max(500).optional(),
});

export const AcceptOrderSchema = z.object({
  riderId: z.string().cuid().optional(), // optional — triggers auto-assign if omitted
});

export const RejectOrderSchema = z.object({
  reason: z.string().min(5).max(500),
});

export type PlaceOrderDto = z.infer<typeof PlaceOrderSchema>;
export type CancelOrderDto = z.infer<typeof CancelOrderSchema>;
export type AcceptOrderDto = z.infer<typeof AcceptOrderSchema>;
export type RejectOrderDto = z.infer<typeof RejectOrderSchema>;
