import { Router } from 'express';
import {
  getUserNotifications, markUserNotifRead, markAllUserNotifsRead,
} from '../../controllers/notification.controller';
import { requireUser } from '../../middlewares/auth.middleware';

const router = Router();

router.use(requireUser);

router.get('/', getUserNotifications);
router.put('/:id/read', markUserNotifRead);
router.put('/read-all', markAllUserNotifsRead);

export default router;
