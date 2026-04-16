import { userRepository } from '../repositories/user.repository';
import { AppError } from '../middlewares/error.middleware';
import { UpdateUserDto, CreateAddressDto, UpdateAddressDto } from '../dtos/user.dto';

export const userService = {
  async getMe(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError('User not found', 404);
    return user;
  },

  async updateMe(userId: string, data: UpdateUserDto) {
    const user = await userRepository.update(userId, data);
    return user;
  },

  async getAddresses(userId: string) {
    return userRepository.getAddresses(userId);
  },

  async createAddress(userId: string, data: CreateAddressDto) {
    return userRepository.createAddress(userId, {
      ...data,
      userId,
      latitude: data.latitude,
      longitude: data.longitude,
    });
  },

  async updateAddress(userId: string, addressId: string, data: UpdateAddressDto) {
    const result = await userRepository.updateAddress(addressId, userId, data);
    if (result.count === 0) throw new AppError('Address not found', 404);
    return userRepository.findAddress(addressId, userId);
  },

  async deleteAddress(userId: string, addressId: string) {
    const result = await userRepository.deleteAddress(addressId, userId);
    if (result.count === 0) throw new AppError('Address not found', 404);
  },
};
