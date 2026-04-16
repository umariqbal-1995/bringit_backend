import { Router } from 'express';
import { storeSendOtp, storeVerifyOtp } from '../../controllers/auth.controller';
import { validate } from '../../middlewares/validate.middleware';
import { authLimiter } from '../../middlewares/rateLimiter.middleware';
import { SendOtpSchema, VerifyOtpSchema } from '../../dtos/auth.dto';

const router = Router();

router.post('/send-otp', authLimiter, validate(SendOtpSchema), storeSendOtp);
router.post('/verify-otp', authLimiter, validate(VerifyOtpSchema), storeVerifyOtp);

export default router;
