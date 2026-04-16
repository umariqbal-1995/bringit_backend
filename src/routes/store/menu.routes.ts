import { Router } from 'express';
import {
  getMyMenu, createMenuItem, updateMenuItem, deleteMenuItem,
} from '../../controllers/store.controller';
import { requireStore } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { CreateMenuItemSchema, UpdateMenuItemSchema } from '../../dtos/store.dto';

const router = Router();

router.use(requireStore);

router.get('/', getMyMenu);
router.post('/', validate(CreateMenuItemSchema), createMenuItem);
router.put('/:id', validate(UpdateMenuItemSchema), updateMenuItem);
router.delete('/:id', deleteMenuItem);

export default router;
