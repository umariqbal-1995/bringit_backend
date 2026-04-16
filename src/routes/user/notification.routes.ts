import { Router } from 'express';
import {
  getUserNotifications, markUserNotifRead, markAllUserNotifsRead, updateUserFcmToken,
} from '../../controllers/notification.controller';
import { requireUser } from '../../middlewares/auth.middleware';

const router = Router();

router.use(requireUser);

router.get('/', getUserNotifications);
router.put('/read-all', markAllUserNotifsRead);
router.put('/:id/read', markUserNotifRead);
router.patch('/fcm-token', updateUserFcmToken);

export default router;
