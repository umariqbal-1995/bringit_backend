import { Router } from 'express';
import { getRiderMe, updateRiderMe, updateAvailability } from '../../controllers/rider.controller';
import { requireRider } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { UpdateRiderProfileSchema, UpdateRiderAvailabilitySchema } from '../../dtos/rider.dto';

const router = Router();

router.use(requireRider);

router.get('/me', getRiderMe);
router.put('/me', validate(UpdateRiderProfileSchema), updateRiderMe);
router.put('/availability', validate(UpdateRiderAvailabilitySchema), updateAvailability);

export default router;
