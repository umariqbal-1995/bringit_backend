import { Router } from 'express';
import { riderSendOtp, riderVerifyOtp } from '../../controllers/auth.controller';
import { validate } from '../../middlewares/validate.middleware';
import { authLimiter } from '../../middlewares/rateLimiter.middleware';
import { SendOtpSchema, VerifyOtpSchema } from '../../dtos/auth.dto';

const router = Router();

// Riders use OTP login (same pattern as user/store)
router.post('/login', authLimiter, validate(SendOtpSchema), riderSendOtp);
router.post('/refresh-token', authLimiter, validate(VerifyOtpSchema), riderVerifyOtp);

export default router;
