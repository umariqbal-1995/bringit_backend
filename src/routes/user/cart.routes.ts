import { Router } from 'express';
import {
  getCart, addCartItem, updateCartItem, deleteCartItem, clearCart,
} from '../../controllers/cart.controller';
import { requireUser } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { AddCartItemSchema, UpdateCartItemSchema } from '../../dtos/cart.dto';

const router = Router();

router.use(requireUser);

router.get('/:storeId', getCart);
router.post('/:storeId/items', validate(AddCartItemSchema), addCartItem);
router.put('/:storeId/items/:itemId', validate(UpdateCartItemSchema), updateCartItem);
router.delete('/:storeId/items/:itemId', deleteCartItem);
router.delete('/:storeId', clearCart);

export default router;
