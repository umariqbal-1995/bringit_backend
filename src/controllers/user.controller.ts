import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service';
import { sendSuccess, sendCreated } from '../utils/response';
import { UpdateUserDto, CreateAddressDto, UpdateAddressDto } from '../dtos/user.dto';

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await userService.getMe(req.user!.userId);
    sendSuccess(res, user);
  } catch (e) { next(e); }
}

export async function updateMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await userService.updateMe(req.user!.userId, req.body as UpdateUserDto);
    sendSuccess(res, user, 'Profile updated');
  } catch (e) { next(e); }
}

export async function getAddresses(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const addresses = await userService.getAddresses(req.user!.userId);
    sendSuccess(res, addresses);
  } catch (e) { next(e); }
}

export async function createAddress(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const address = await userService.createAddress(req.user!.userId, req.body as CreateAddressDto);
    sendCreated(res, address, 'Address added');
  } catch (e) { next(e); }
}

export async function updateAddress(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const address = await userService.updateAddress(
      req.user!.userId,
      req.params['id']!,
      req.body as UpdateAddressDto,
    );
    sendSuccess(res, address, 'Address updated');
  } catch (e) { next(e); }
}

export async function deleteAddress(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await userService.deleteAddress(req.user!.userId, req.params['id']!);
    sendSuccess(res, null, 'Address deleted');
  } catch (e) { next(e); }
}
