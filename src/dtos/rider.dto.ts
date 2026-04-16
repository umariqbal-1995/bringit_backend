import { z } from 'zod';

export const UpdateRiderProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  fcmToken: z.string().optional(),
});

export const UpdateRiderAvailabilitySchema = z.object({
  isAvailable: z.boolean(),
});

export const UpdateRiderLocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export type UpdateRiderProfileDto = z.infer<typeof UpdateRiderProfileSchema>;
export type UpdateRiderAvailabilityDto = z.infer<typeof UpdateRiderAvailabilitySchema>;
export type UpdateRiderLocationDto = z.infer<typeof UpdateRiderLocationSchema>;
