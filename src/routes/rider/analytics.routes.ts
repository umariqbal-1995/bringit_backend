import { Router } from 'express';
import {
  getRiderAnalyticsOverview, getRiderAnalyticsEarnings,
  getRiderAnalyticsDeliveries, getRiderAnalyticsPerformance,
} from '../../controllers/rider.controller';
import { requireRider } from '../../middlewares/auth.middleware';

const router = Router();

router.use(requireRider);

router.get('/overview', getRiderAnalyticsOverview);
router.get('/earnings', getRiderAnalyticsEarnings);
router.get('/deliveries', getRiderAnalyticsDeliveries);
router.get('/performance', getRiderAnalyticsPerformance);

export default router;
