import { Router } from 'express';
import {
  getMyStoreProducts, createStoreProduct, updateStoreProduct, deleteStoreProduct,
} from '../../controllers/store.controller';
import { requireStore } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { CreateStoreProductSchema, UpdateStoreProductSchema } from '../../dtos/store.dto';

const router = Router();

router.use(requireStore);

router.get('/', getMyStoreProducts);
router.post('/', validate(CreateStoreProductSchema), createStoreProduct);
router.put('/:id', validate(UpdateStoreProductSchema), updateStoreProduct);
router.delete('/:id', deleteStoreProduct);

export default router;
