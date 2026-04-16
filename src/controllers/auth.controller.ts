import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { sendSuccess } from '../utils/response';

// ─── User Auth ────────────────────────────────────────────────────────────────

export async function userSendOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await authService.sendUserOtp(req.body.phone as string);
    sendSuccess(res, null, 'OTP sent successfully');
  } catch (e) { next(e); }
}

export async function userVerifyOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { phone, otp } = req.body as { phone: string; otp: string };
    const result = await authService.verifyUserOtp(phone, otp);
    sendSuccess(res, result, 'Login successful');
  } catch (e) { next(e); }
}

// ─── Store Auth ───────────────────────────────────────────────────────────────

export async function storeSendOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await authService.sendStoreOtp(req.body.phone as string);
    sendSuccess(res, null, 'OTP sent successfully');
  } catch (e) { next(e); }
}

export async function storeVerifyOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { phone, otp } = req.body as { phone: string; otp: string };
    const result = await authService.verifyStoreOtp(phone, otp);
    sendSuccess(res, result, 'Store login successful');
  } catch (e) { next(e); }
}

// ─── Rider Auth ───────────────────────────────────────────────────────────────

export async function riderSendOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await authService.sendRiderOtp(req.body.phone as string);
    sendSuccess(res, null, 'OTP sent successfully');
  } catch (e) { next(e); }
}

export async function riderVerifyOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { phone, otp } = req.body as { phone: string; otp: string };
    const result = await authService.verifyRiderOtp(phone, otp);
    sendSuccess(res, result, 'Rider login successful');
  } catch (e) { next(e); }
}
