import { Router } from 'express';
import { getMe, updateMe } from '../../controllers/user.controller';
import { requireUser } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { UpdateUserSchema } from '../../dtos/user.dto';

const router = Router();

router.get('/me', requireUser, getMe);
router.put('/me', requireUser, validate(UpdateUserSchema), updateMe);

export default router;
