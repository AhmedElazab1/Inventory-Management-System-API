import { catchAsync } from '../../common/utils/catchAsync';
import { NextFunction, Request, Response } from 'express';
import logger from '../../common/utils/logger';
import { STATUS_CODE, STATUS } from '../../common/constants/constants';
import { createUserService, getAllUsersService } from './user.service';

export const createUser = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const data = req.body;
  const { name, email } = await createUserService(data);

  logger.info('user created successfully');

  res.status(STATUS_CODE.SUCCESS).json({
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
    success: STATUS.SUCCESS,
    message: 'Users fetched successfully',
    ...users,
  });
});
