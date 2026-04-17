import { Router } from 'express';
import { testPushNotification } from '../controllers/notification.controller';

// ─── User App Routes ──────────────────────────────────────────────────────────
import userAuthRoutes from './user/auth.routes';
import userRoutes from './user/user.routes';
import addressRoutes from './user/address.routes';
import userStoreRoutes from './user/store.routes';
import cartRoutes from './user/cart.routes';
import userOrderRoutes from './user/order.routes';
import userNotifRoutes from './user/notification.routes';
import favoriteRoutes from './user/favorite.routes';

// ─── Store App Routes ─────────────────────────────────────────────────────────
import storeAuthRoutes from './store/auth.routes';
import storeProfileRoutes from './store/profile.routes';
import storeProductsRoutes from './store/products.routes';
import storeMenuRoutes from './store/menu.routes';
import storeOrderRoutes from './store/orders.routes';
import storeRidersRoutes from './store/riders.routes';
import storeAnalyticsRoutes from './store/analytics.routes';
import storeNotifRoutes from './store/notifications.routes';

// ─── Rider App Routes ─────────────────────────────────────────────────────────
import riderAuthRoutes from './rider/auth.routes';
import riderProfileRoutes from './rider/profile.routes';
import riderLocationRoutes from './rider/location.routes';
import riderOrderRoutes from './rider/orders.routes';
import riderEarningsRoutes from './rider/earnings.routes';
import riderAnalyticsRoutes from './rider/analytics.routes';
import riderNotifRoutes from './rider/notifications.routes';

const router = Router();

// ── Health Check ──────────────────────────────────────────────────────────────
router.get('/health', (_req, res) => {
  res.json({ success: true, message: 'BringIt API is running', timestamp: new Date().toISOString() });
});

// ── Dev: Test push notification (no auth — remove in production) ───────────
router.post('/dev/test-push', testPushNotification);

// ── USER APP ──────────────────────────────────────────────────────────────────
router.use('/auth', userAuthRoutes);
router.use('/', userRoutes);                     // GET /me, PUT /me
router.use('/addresses', addressRoutes);
router.use('/', userStoreRoutes);                // GET /stores, /restaurants, etc.
router.use('/cart', cartRoutes);
router.use('/orders', userOrderRoutes);
router.use('/notifications', userNotifRoutes);
router.use('/favorites', favoriteRoutes);

// ── STORE APP ─────────────────────────────────────────────────────────────────
router.use('/store/auth', storeAuthRoutes);
router.use('/store', storeProfileRoutes);        // GET /store/me, etc.
router.use('/store/products', storeProductsRoutes);
router.use('/store/menu', storeMenuRoutes);
router.use('/store/orders', storeOrderRoutes);
router.use('/store/riders', storeRidersRoutes);
router.use('/store/analytics', storeAnalyticsRoutes);
router.use('/store/notifications', storeNotifRoutes);

// ── RIDER APP ─────────────────────────────────────────────────────────────────
router.use('/rider/auth', riderAuthRoutes);
router.use('/rider', riderProfileRoutes);        // GET /rider/me, etc.
router.use('/rider/location', riderLocationRoutes);
router.use('/rider/orders', riderOrderRoutes);
router.use('/rider/earnings', riderEarningsRoutes);
router.use('/rider/analytics', riderAnalyticsRoutes);
router.use('/rider/notifications', riderNotifRoutes);

export default router;
