import { Router } from 'express';
import {
  getAddresses, createAddress, updateAddress, deleteAddress,
} from '../../controllers/user.controller';
import { requireUser } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { CreateAddressSchema, UpdateAddressSchema } from '../../dtos/user.dto';

const router = Router();

router.use(requireUser);

router.get('/', getAddresses);
router.post('/', validate(CreateAddressSchema), createAddress);
router.put('/:id', validate(UpdateAddressSchema), updateAddress);
router.delete('/:id', deleteAddress);

export default router;
