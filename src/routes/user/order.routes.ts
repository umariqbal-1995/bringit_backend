import { Router } from 'express';
import {
  placeOrder, getMyOrders, getMyOrder, cancelMyOrder,
} from '../../controllers/order.controller';
import { requireUser } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { PlaceOrderSchema, CancelOrderSchema } from '../../dtos/order.dto';

const router = Router();

router.use(requireUser);

router.post('/', validate(PlaceOrderSchema), placeOrder);
router.get('/', getMyOrders);
router.get('/:id', getMyOrder);
router.post('/:id/cancel', validate(CancelOrderSchema), cancelMyOrder);

export default router;
