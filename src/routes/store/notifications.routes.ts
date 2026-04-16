import { Router } from 'express';
import {
  getStoreNotifications, markStoreNotifRead, markAllStoreNotifsRead,
} from '../../controllers/notification.controller';
import { requireStore } from '../../middlewares/auth.middleware';

const router = Router();

router.use(requireStore);

router.get('/', getStoreNotifications);
router.put('/:id/read', markStoreNotifRead);
router.put('/read-all', markAllStoreNotifsRead);

export default router;
