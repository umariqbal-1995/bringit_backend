import { Router } from 'express';
import {
  getAnalyticsOverview,
  getAnalyticsSales,
  getAnalyticsTopProducts,
  getAnalyticsRevenueTrend,
} from '../../controllers/store.controller';
import { requireStore } from '../../middlewares/auth.middleware';

const router = Router();

router.use(requireStore);

router.get('/overview', getAnalyticsOverview);
router.get('/sales', getAnalyticsSales);
router.get('/orders', getAnalyticsSales); // reuse sales (grouped by status)
router.get('/top-products', getAnalyticsTopProducts);
router.get('/revenue-trend', getAnalyticsRevenueTrend);

export default router;
