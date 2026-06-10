import { z } from 'zod';
import { userRegisterSchema, userLoginSchema } from './auth.validation';
import { Types } from 'mongoose';
import { JwtPayload } from 'jsonwebtoken';

export type UserRequestDTO = z.infer<typeof userRegisterSchema>;
export interface UserResponseDTO {
  id: string;
  name: string;
  email: string;
  role: string;
}

export type RegisterRequestDTO = z.infer<typeof userRegisterSchema>;
export interface RegisterResponseDTO {
  name: string;
  email: string;
  role: string;
}

export type LoginRequestDTO = z.infer<typeof userLoginSchema>;
export interface LoginResponseDTO {
  user: UserResponseDTO;
  accessToken: string;
  refreshToken: string;
}

export type CreateRefreshTokenInput = {
  userId: string;
};
export type RefreshTokenResponse = {
  refreshToken: string;
  expiresAt: Date;
  userId: string;
};
