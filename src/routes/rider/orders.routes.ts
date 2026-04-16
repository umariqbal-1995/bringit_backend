import { Router } from 'express';
import {
  getAssignedOrders, getRiderOrder, pickupOrder, startDelivery,
  completeOrder, riderCancelOrder,
} from '../../controllers/order.controller';
import { requireRider } from '../../middlewares/auth.middleware';

const router = Router();

router.use(requireRider);

router.get('/assigned', getAssignedOrders);
router.get('/:id', getRiderOrder);
router.post('/:id/accept', pickupOrder);        // accept = pickup in rider flow
router.post('/:id/pickup', pickupOrder);
router.post('/:id/start-delivery', startDelivery);
router.post('/:id/complete', completeOrder);
router.post('/:id/cancel', riderCancelOrder);

export default router;
