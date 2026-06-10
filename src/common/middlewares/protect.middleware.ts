import { Request, Response, NextFunction } from 'express';
import prisma from '../../config/prisma';
import { catchAsync } from '../utils/catchAsync';
import { STATUS_CODE } from '../constants/responseCode';
import AppError from '../utils/ApiError';
import type { TokenPayload } from '../Interfaces/types';
import { verifyAccessToken } from '../../modules/auth/services/token.service';

export const extractBearerToken = (authHeader: string | undefined): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.split(' ')[1];
};

export const authenticate = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    return next(new AppError('Please login to access this route', STATUS_CODE.UNAUTHORIZED));
  }

  const decoded: TokenPayload = await verifyAccessToken(token);

  const user = await prisma.user.findUnique({
    where: {
      id: decoded.id,
    },
  });

  if (!user) {
    return next(
      new AppError('The user belonging to this token no longer exists', STATUS_CODE.UNAUTHORIZED),
    );
  }

  req.user = user;
  next();
});

export default authenticate;
