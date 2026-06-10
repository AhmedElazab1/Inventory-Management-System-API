import express from 'express';
import { createUser, getAllUsers } from './user.controller';
import { validate } from '../../common/middlewares/validation';
import { userRegisterSchema } from '../auth/auth.validation';
import { authenticate, authorize } from '../../common/middlewares/index';
import { Role } from '../../../generated/client/enums';
import { usersQuerySchema } from './user.validation';

const router = express.Router();

router.post(
  '/',
  authenticate,
  authorize(Role.ADMIN),
  validate({ body: userRegisterSchema }),
  createUser,
);

router.get(
  '/',
  authenticate,
  authorize(Role.ADMIN),
  validate({ query: usersQuerySchema }),
  getAllUsers,
);

export default router;
