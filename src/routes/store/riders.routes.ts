import { Router } from 'express';
import {
  getStoreRiders, createRider, updateRider, deleteRider,
} from '../../controllers/store.controller';
import { requireStore } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { CreateRiderSchema, UpdateRiderSchema } from '../../dtos/store.dto';

const router = Router();

router.use(requireStore);

router.get('/', getStoreRiders);
router.post('/', validate(CreateRiderSchema), createRider);
router.put('/:id', validate(UpdateRiderSchema), updateRider);
router.delete('/:id', deleteRider);

export default router;
