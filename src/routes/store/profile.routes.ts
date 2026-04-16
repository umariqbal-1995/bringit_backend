import { Router } from 'express';
import {
  getMyStore, updateMyStore, updateStoreStatus, getDashboardSummary,
} from '../../controllers/store.controller';
import { requireStore } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { UpdateStoreProfileSchema, UpdateStoreStatusSchema } from '../../dtos/store.dto';

const router = Router();

router.use(requireStore);

router.get('/me', getMyStore);
router.put('/me', validate(UpdateStoreProfileSchema), updateMyStore);
router.put('/status', validate(UpdateStoreStatusSchema), updateStoreStatus);
router.get('/dashboard/summary', getDashboardSummary);

export default router;
