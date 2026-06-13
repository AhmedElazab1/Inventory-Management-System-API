import { Request, Response, NextFunction } from 'express';
import { STATUS_CODE, STATUS } from '../../common/constants/constants';
import AppError from '../../common/utils/ApiError';
import prisma from '../../config/prisma';
import { catchAsync } from '../../common/utils/catchAsync';

export const allowFirstBootstrap = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Check if first user is already registered
    const existingUser = await prisma.user.findFirst({
      where: {
        role: 'ADMIN',
      },
    });
    if (existingUser) {
      throw new AppError('System already initialized', STATUS_CODE.FORBIDDEN);
    }

    next();
  },
);
