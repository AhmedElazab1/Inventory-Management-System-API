import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../../common/utils/catchAsync';
import { STATUS_CODE, STATUS } from '../../common/constants/constants';
import logger from '../../common/utils/logger';
import {
  bootstrapRegisterService,
  loginService,
  refreshService,
  logoutService,
  getCurrentUserService,
} from './services/auth.service';
import { clearRefreshTokenCookie, setRefreshTokenCookie } from './services/refresh.service';
import AppError from '../../common/utils/ApiError';

export const bootstrapRegister = catchAsync(async (req: Request, res: Response): Promise<void> => {
  // Get data from request body
  const data = req.body;
  const { name, email, role } = await bootstrapRegisterService(data);

  logger.info('User registered successfully');

  res.status(STATUS_CODE.SUCCESS).json({
    status: STATUS.SUCCESS,
    message: 'User registered successfully',
    data: {
      name,
      email,
      role,
    },
  });
});

export const login = catchAsync(async (req: Request, res: Response): Promise<void> => {
  // Get data from request body
  const data = req.body;
  const { user, refreshToken, accessToken } = await loginService(data);

  logger.info('User logged in successfully');

  // Set refresh token cookie
  setRefreshTokenCookie(res, refreshToken);

  res.status(STATUS_CODE.SUCCESS).json({
    status: STATUS.SUCCESS,
    message: 'User logged in successfully',
    data: {
      user,
      accessToken,
    },
  });
});

export const refresh = catchAsync(async (req: Request, res: Response): Promise<void> => {
  // Get refresh token from cookie
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    throw new AppError('Refresh token not found', STATUS_CODE.UNAUTHORIZED);
  }

  const { accessToken, refreshToken: newRefreshToken } = await refreshService(refreshToken);

  logger.info('Token refreshed successfully');

  // Set refresh token cookie
  setRefreshTokenCookie(res, newRefreshToken);

  res.status(STATUS_CODE.SUCCESS).json({
    status: STATUS.SUCCESS,
    token: accessToken,
  });
});

export const logout = catchAsync(async (req: Request, res: Response): Promise<void> => {
  // Get access token from request headers
  const accessToken = req.headers.authorization?.split(' ')[1] as string;
  // Get refresh token from request cookies
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    throw new AppError('Refresh token not found', STATUS_CODE.UNAUTHORIZED);
  }

  await logoutService(accessToken, refreshToken);

  logger.info('User logged out successfully');

  // Clear refresh token cookie
  clearRefreshTokenCookie(res);

  res.status(STATUS_CODE.SUCCESS).json({
    status: STATUS.SUCCESS,
    message: 'User logged out successfully',
  });
});

export const getCurrentUser = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const user = await getCurrentUserService(req.user!.id);

  logger.info('User retrieved successfully');

  res.status(STATUS_CODE.SUCCESS).json({
    status: STATUS.SUCCESS,
    message: 'User retrieved successfully',
    data: user,
  });
});
