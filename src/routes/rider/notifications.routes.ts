import { Router } from 'express';
import {
  getRiderNotifications, markRiderNotifRead, markAllRiderNotifsRead,
} from '../../controllers/notification.controller';
import { requireRider } from '../../middlewares/auth.middleware';

const router = Router();

router.use(requireRider);

router.get('/', getRiderNotifications);
router.put('/:id/read', markRiderNotifRead);
router.put('/read-all', markAllRiderNotifsRead);

export default router;
