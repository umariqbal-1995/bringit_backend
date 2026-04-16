import { Router } from 'express';
import { getFavorites, addFavorite, removeFavorite } from '../../controllers/favorite.controller';
import { requireUser } from '../../middlewares/auth.middleware';

const router = Router();

router.use(requireUser);

router.get('/', getFavorites);
router.post('/:storeId', addFavorite);
router.delete('/:storeId', removeFavorite);

export default router;
