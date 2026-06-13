import { Request, Response, NextFunction } from 'express';
import { Role } from '../../../generated/client/enums';
import AppError from '../utils/ApiError';
import { STATUS_CODE } from '../constants/responseCode';

export const authorize = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Please login to access this route', STATUS_CODE.UNAUTHORIZED));
    }

    if (!allowedRoles.includes(req.user.role as Role)) {
      return next(
        new AppError('You do not have permission to perform this action', STATUS_CODE.FORBIDDEN),
      );
    }
    next();
  };
};

export const restrictedTo = authorize;
