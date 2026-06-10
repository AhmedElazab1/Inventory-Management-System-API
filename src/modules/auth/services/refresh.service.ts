import { CreateRefreshTokenInput, RefreshTokenResponse } from '../auth.DTOs';
import { generateSecureToken, hashToken } from './token.service';
import env from '../../../config/env';
import prisma from '../../../config/prisma';
import { Response } from 'express';
import ms from 'ms';
import { STATUS_CODE } from '../../../common/constants/responseCode';
import AppError from '../../../common/utils/ApiError';

const refreshCookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: ms(env.REFRESH_TOKEN_EXPIRES_IN as ms.StringValue),
};

export const setRefreshTokenCookie = (res: Response, refreshToken: string): void => {
  res.cookie('refreshToken', refreshToken, refreshCookieOptions);
};

export const clearRefreshTokenCookie = (res: Response): void => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  });
};

export const createRefreshToken = async (
  input: CreateRefreshTokenInput,
): Promise<RefreshTokenResponse> => {
  const { userId } = input;

  const refreshToken = generateSecureToken();
  const hashesToken = hashToken(refreshToken);

  const expiresIn = ms(env.REFRESH_TOKEN_EXPIRES_IN as ms.StringValue);
  const expiresAt = new Date(Date.now() + expiresIn);

  await prisma.token.create({
    data: {
      token: hashesToken,
      userId,
      expiresAt,
    },
  });

  return { refreshToken, expiresAt, userId };
};

export const validateRefreshToken = async (token: string) => {
  // hash the refresh token to compare it with the stored token in DB
  const hashedToken = hashToken(token);

  // Find refresh token in DB
  const refreshToken = await prisma.token.findUnique({
    where: {
      token: hashedToken,
    },
  });

  if (!refreshToken) {
    throw new AppError('Invalid refresh token', STATUS_CODE.UNAUTHORIZED);
  }

  // Check if refresh token has been revoked
  if (refreshToken.revoked) {
    throw new AppError('Refresh token has been revoked', STATUS_CODE.UNAUTHORIZED);
  }

  // Check if refresh token has expired
  if (refreshToken.expiresAt < new Date()) {
    throw new AppError('Refresh token has expired', STATUS_CODE.UNAUTHORIZED);
  }

  return refreshToken;
};

export const rotateRefreshToken = async (
  oldToken: string,
  userId: string,
): Promise<RefreshTokenResponse> => {
  await revokeRefreshToken(oldToken);

  const refreshToken = await createRefreshToken({ userId });

  return refreshToken;
};

export const revokeRefreshToken = async (token: string) => {
  const hashedToken = hashToken(token);

  await prisma.token.update({
    where: {
      token: hashedToken,
    },
    data: {
      revoked: true,
      revokedAt: new Date(),
    },
  });
};
