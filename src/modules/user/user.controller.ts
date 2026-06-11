import { catchAsync } from '../../common/utils/catchAsync';
import { NextFunction, Request, Response } from 'express';
import logger from '../../common/utils/logger';
import { STATUS_CODE, STATUS } from '../../common/constants/constants';
import {
  createUserService,
  getAllUsersService,
  getUserByIdService,
  updateUserService,
  deleteUserService,
} from './user.service';
import { ParamsIdDTO } from './user.DTOs';

export const createUser = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const data = req.body;
  const { name, email } = await createUserService(data);

  logger.info('user created successfully');

  res.status(STATUS_CODE.CREATED).json({
    status: STATUS.SUCCESS,
    message: 'User registered successfully',
    data: {
      name,
      email,
    },
  });
});

export const getAllUsers = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const query = req.query;
  const users = await getAllUsersService(query);

  logger.info(`Users fetched successfully: ${users}`);

  res.status(STATUS_CODE.SUCCESS).json({
    status: STATUS.SUCCESS,
    message: 'Users fetched successfully',
    ...users,
  });
});

export const getUserById = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const user = await getUserByIdService({ id } as ParamsIdDTO);

  logger.info(`User fetched successfully: ${user}`);

  res.status(STATUS_CODE.SUCCESS).json({
    status: STATUS.SUCCESS,
    message: 'User fetched successfully',
    data: user,
  });
});

export const updateUser = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const data = req.body;
  const user = await updateUserService({ id } as ParamsIdDTO, data);

  logger.info(`User updated successfully: ${user}`);

  res.status(STATUS_CODE.SUCCESS).json({
    status: STATUS.SUCCESS,
    message: 'User updated successfully',
    data: user,
  });
});

export const deleteUser = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const currentUser = req.user?.id as string;
  const user = await deleteUserService(currentUser, { id } as ParamsIdDTO);

  logger.info(`User deleted successfully: ${user}`);

  res.status(STATUS_CODE.SUCCESS).json({
    status: STATUS.SUCCESS,
    message: 'User deleted successfully',
  });
});
