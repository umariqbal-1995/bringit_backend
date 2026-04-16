import { Router } from 'express';
import {
  getRiderNotifications, markRiderNotifRead, markAllRiderNotifsRead, updateRiderFcmToken,
} from '../../controllers/notification.controller';
import { requireRider } from '../../middlewares/auth.middleware';

const router = Router();

router.use(requireRider);

router.get('/', getRiderNotifications);
router.put('/read-all', markAllRiderNotifsRead);
router.put('/:id/read', markRiderNotifRead);
router.patch('/fcm-token', updateRiderFcmToken);

export default router;
