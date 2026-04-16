import { Router } from 'express';
import {
  getStoreOrders, getStoreOrder, acceptOrder, rejectOrder, markPreparing, markReady,
} from '../../controllers/order.controller';
import { requireStore } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { AcceptOrderSchema, RejectOrderSchema } from '../../dtos/order.dto';

const router = Router();

router.use(requireStore);

router.get('/', getStoreOrders);
router.get('/:id', getStoreOrder);
router.post('/:id/accept', validate(AcceptOrderSchema), acceptOrder);
router.post('/:id/reject', validate(RejectOrderSchema), rejectOrder);
router.post('/:id/prepare', markPreparing);
router.post('/:id/mark-ready', markReady);

export default router;
