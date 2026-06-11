import express from 'express';
import { createUser, getAllUsers, getUserById, updateUser, deleteUser } from './user.controller';
import { validate } from '../../common/middlewares/validation';
import { userRegisterSchema } from '../auth/auth.validation';
import { authenticate, authorize } from '../../common/middlewares/index';
import { Role } from '../../../generated/client/enums';
import { paramsIdSchema, usersQuerySchema, updateUserSchema } from './user.validation';

const router = express.Router();

router.use(authenticate, authorize(Role.ADMIN));

router.post('/', validate({ body: userRegisterSchema }), createUser);
router.get('/', validate({ query: usersQuerySchema }), getAllUsers);
router.get('/:id', validate({ params: paramsIdSchema }), getUserById);
router.patch('/:id', validate({ params: paramsIdSchema, body: updateUserSchema }), updateUser);
router.delete('/:id', validate({ params: paramsIdSchema }), deleteUser);

export default router;
