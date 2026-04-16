import { Router } from 'express';
import { getEarningsSummary, getEarningsHistory } from '../../controllers/rider.controller';
import { requireRider } from '../../middlewares/auth.middleware';

const router = Router();

router.use(requireRider);

router.get('/summary', getEarningsSummary);
router.get('/history', getEarningsHistory);

export default router;
