import prisma from '../../../config/prisma';
import {
  RegisterResponseDTO,
  RegisterRequestDTO,
  LoginResponseDTO,
  LoginRequestDTO,
  UserResponseDTO,
} from '../auth.DTOs';
import { hashPassword, comparePassword, generateAccessToken } from './token.service';
import { sanitizeUser } from '../auth.mappers';
import { STATUS_CODE, STATUS } from '../../../common/constants/constants';
import AppError from '../../../common/utils/ApiError';
import {
  createRefreshToken,
  validateRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
} from './refresh.service';
import { Role } from '../../../../generated/client/enums';

export const bootstrapRegisterService = async (
  data: RegisterRequestDTO,
): Promise<RegisterResponseDTO> => {
  const { name, email, password } = data;

  const hashedPassword = await hashPassword(password);

  // Create user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      role: Role.ADMIN,
      password: hashedPassword,
    },
  });

  // Return sanitized user
  return sanitizeUser(user);
};

export const loginService = async (data: LoginRequestDTO): Promise<LoginResponseDTO> => {
  const { email, password } = data;

  // Find user by email
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError('Invalid credentials', STATUS_CODE.UNAUTHORIZED);
  }

  // Compare password
  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new AppError('Invalid credentials', STATUS_CODE.UNAUTHORIZED);
  }

  // Generate access token
  const accessToken = generateAccessToken(user.id);

  // Generate refresh token
  const { refreshToken } = await createRefreshToken({
    userId: user.id,
  });

  // Return sanitized user and tokens
  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken,
  };
};

export const refreshService = async (
  refreshToken: string,
): Promise<{ accessToken: string; refreshToken: string }> => {
  // Validate refresh token
  const decodedToken = await validateRefreshToken(refreshToken);

  // Generate new access token
  const newAccessToken = generateAccessToken(decodedToken.userId);

  // Rotate refresh token
  const { refreshToken: newRefreshToken } = await rotateRefreshToken(
    refreshToken,
    decodedToken.userId,
  );

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

export const logoutService = async (accessToken: string, refreshToken: string): Promise<void> => {
  // Revoke refresh token
  await revokeRefreshToken(refreshToken);
};

export const getCurrentUserService = async (userId: string): Promise<UserResponseDTO> => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError('User not found', STATUS_CODE.NOT_FOUND);
  }
  return sanitizeUser(user);
};
