import { sendOtp, verifyOtp } from '../utils/otp';
import { signUserToken, signStoreToken, signRiderToken } from '../utils/jwt';
import { userRepository } from '../repositories/user.repository';
import { storeRepository } from '../repositories/store.repository';
import { riderRepository } from '../repositories/rider.repository';
import { AppError } from '../middlewares/error.middleware';

export const authService = {
  // ─── User (Customer) Auth ─────────────────────────────────────────────────

  async sendUserOtp(phone: string): Promise<void> {
    await sendOtp(phone, 'USER');
  },

  async verifyUserOtp(phone: string, otp: string) {
    const valid = await verifyOtp(phone, 'USER', otp);
    if (!valid) throw new AppError('Invalid or expired OTP', 400);

    // Create user if first-time login
    const user = await userRepository.upsertByPhone(phone);
    const token = signUserToken(user.id);
    return { token, user };
  },

  // ─── Store Auth ───────────────────────────────────────────────────────────

  async sendStoreOtp(phone: string): Promise<void> {
    let store = await storeRepository.findByPhone(phone);
    if (!store) store = await storeRepository.createStub(phone);
    await sendOtp(phone, 'STORE');
  },

  async verifyStoreOtp(phone: string, otp: string) {
    const valid = await verifyOtp(phone, 'STORE', otp);
    if (!valid) throw new AppError('Invalid or expired OTP', 400);

    const store = await storeRepository.findByPhone(phone);
    if (!store) throw new AppError('Store not found', 404);

    const token = signStoreToken(store.id);
    const isNew = store.name === 'My Store';
    return { token, store, isNew };
  },

  // ─── Rider Auth ───────────────────────────────────────────────────────────

  async sendRiderOtp(phone: string): Promise<void> {
    const rider = await riderRepository.findByPhone(phone);
    if (!rider) throw new AppError('No rider registered with this phone number', 404);
    await sendOtp(phone, 'RIDER');
  },

  async verifyRiderOtp(phone: string, otp: string) {
    const valid = await verifyOtp(phone, 'RIDER', otp);
    if (!valid) throw new AppError('Invalid or expired OTP', 400);

    const rider = await riderRepository.findByPhone(phone);
    if (!rider) throw new AppError('Rider not found', 404);

    const token = signRiderToken(rider.id);
    return { token, rider };
  },
};
