import { Router } from 'express';
import { updateLocation } from '../../controllers/rider.controller';
import { requireRider } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { UpdateRiderLocationSchema } from '../../dtos/rider.dto';

const router = Router();

router.use(requireRider);

router.post('/', validate(UpdateRiderLocationSchema), updateLocation);

export default router;
