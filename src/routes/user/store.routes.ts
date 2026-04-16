import { Router } from 'express';
import {
  listStores, listRestaurants, getStoreProducts, getRestaurantMenu,
} from '../../controllers/store.controller';

const router = Router();

// Public — no auth required
router.get('/stores', listStores);
router.get('/restaurants', listRestaurants);
router.get('/stores/:id/products', getStoreProducts);
router.get('/restaurants/:id/menu', getRestaurantMenu);

export default router;
