import { Router } from 'express';
import {
  getStoreNotifications, markStoreNotifRead, markAllStoreNotifsRead, updateStoreFcmToken,
} from '../../controllers/notification.controller';
import { requireStore } from '../../middlewares/auth.middleware';

const router = Router();

router.use(requireStore);

router.get('/', getStoreNotifications);
router.put('/read-all', markAllStoreNotifsRead);
router.put('/:id/read', markStoreNotifRead);
router.patch('/fcm-token', updateStoreFcmToken);

export default router;
