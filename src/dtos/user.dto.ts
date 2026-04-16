import { z } from 'zod';

export const UpdateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  avatarUrl: z.string().url().optional(),
  fcmToken: z.string().optional(),
});

export const CreateAddressSchema = z.object({
  label: z.string().min(1).max(50),
  street: z.string().min(1).max(255),
  city: z.string().min(1).max(100),
  state: z.string().max(100).optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const UpdateAddressSchema = CreateAddressSchema.partial();

export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
export type CreateAddressDto = z.infer<typeof CreateAddressSchema>;
export type UpdateAddressDto = z.infer<typeof UpdateAddressSchema>;
