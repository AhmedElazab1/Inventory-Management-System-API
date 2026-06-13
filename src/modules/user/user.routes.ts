import express from 'express';
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  changePassword,
  resetPassword,
} from './user.controller';
import { validate } from '../../common/middlewares/validation';
import { userRegisterSchema } from '../auth/auth.validation';
import { authenticate, authorize } from '../../common/middlewares/index';
import { Role } from '../../../generated/client/enums';
import {
  paramsIdSchema,
  usersQuerySchema,
  updateUserSchema,
  changePasswordSchema,
  resetPasswordSchema,
} from './user.validation';

const router = express.Router();

router.post('/me/change-password', validate({ body: changePasswordSchema }), changePassword);
router.post('/reset-password/:id', validate({ body: resetPasswordSchema }), resetPassword);

router.use(authenticate, authorize(Role.ADMIN));

router.post('/', validate({ body: userRegisterSchema }), createUser);
router.get('/', validate({ query: usersQuerySchema }), getAllUsers);
router.get('/:id', validate({ params: paramsIdSchema }), getUserById);
router.patch('/:id', validate({ params: paramsIdSchema, body: updateUserSchema }), updateUser);
router.delete('/:id', validate({ params: paramsIdSchema }), deleteUser);

export default router;
