import { UserRequestDTO, UserResponseDTO } from '../auth/auth.DTOs';
import { comparePassword, hashPassword } from '../auth/services/token.service';
import prisma from '../../config/prisma';
import { Role } from '../../../generated/client/enums';
import { sanitizeUser } from '../auth/auth.mappers';
import {
  IQueryStr,
  UpdateUserDTO,
  ParamsIdDTO,
  ChangePasswordDTO,
  ResetPasswordDTO,
} from './user.DTOs';
import { paginate, parseQueryParams, PaginatedResult } from '../../common/utils/APIFeatures';
import ApiError from '../../common/utils/ApiError';
import { STATUS_CODE } from '../../common/constants/constants';
import { User } from '../../../generated/client/client';

export const createUserService = async (data: UserRequestDTO): Promise<UserResponseDTO> => {
  const { name, email, password } = data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new ApiError('Email already in use', STATUS_CODE.CONFLICT);

  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: Role.CASHIER,
    },
  });

  return sanitizeUser(user);
};

export const getAllUsersService = async (
  query: IQueryStr,
): Promise<PaginatedResult<UserResponseDTO>> => {
  const options = parseQueryParams(query);
  const result = await paginate<User>(prisma.user, options);

  return {
    ...result,
    data: sanitizeUser(result.data),
  };
};

export const getUserByIdService = async (params: ParamsIdDTO): Promise<UserResponseDTO> => {
  const user = await prisma.user.findUnique({
    where: { id: params.id },
  });

  if (!user) {
    throw new ApiError('User not found', STATUS_CODE.NOT_FOUND);
  }

  return sanitizeUser(user);
};

export const updateUserService = async (
  params: ParamsIdDTO,
  data: UpdateUserDTO,
): Promise<UserResponseDTO> => {
  const existingUser = await prisma.user.findUnique({ where: { id: params.id } });
  if (!existingUser) throw new ApiError('User not found', STATUS_CODE.NOT_FOUND);

  if (data.email) {
    const emailTaken = await prisma.user.findFirst({
      where: { email: data.email, NOT: { id: params.id } },
    });
    if (emailTaken) throw new ApiError('Email already in use', STATUS_CODE.CONFLICT);
  }

  const updateData = { ...data };

  if (data.password) {
    updateData.password = await hashPassword(data.password);
  }

  const user = await prisma.user.update({
    where: { id: params.id },
    data: updateData,
  });

  return sanitizeUser(user);
};

export const deleteUserService = async (
  currentUserId: string,
  params: ParamsIdDTO,
): Promise<UserResponseDTO> => {
  const existingUser = await prisma.user.findUnique({ where: { id: params.id } });
  if (!existingUser) throw new ApiError('User not found', STATUS_CODE.NOT_FOUND);

  if (currentUserId === params.id) {
    throw new ApiError('Cannot delete your own account', STATUS_CODE.BAD_REQUEST);
  }

  const user = await prisma.user.delete({
    where: { id: params.id },
  });

  return sanitizeUser(user);
};

export const changePasswordService = async (userId: ParamsIdDTO, data: ChangePasswordDTO) => {
  const { oldPassword, newPassword } = data;
  const user = await prisma.user.findUnique({ where: { id: userId.id } });
  if (!user) throw new ApiError('User not found', STATUS_CODE.NOT_FOUND);

  const isPasswordValid = await comparePassword(oldPassword, user.password);
  if (!isPasswordValid) throw new ApiError('Invalid old password', STATUS_CODE.BAD_REQUEST);

  const hashedPassword = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: userId.id },
    data: {
      password: hashedPassword,
    },
  });
};

export const resetPasswordService = async (params: ParamsIdDTO, data: ResetPasswordDTO) => {
  const { id } = params;
  const { newPassword } = data;

  const existingUser = await prisma.user.findUnique({ where: { id } });
  if (!existingUser) throw new ApiError('User not found', STATUS_CODE.NOT_FOUND);

  const hashedPassword = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id },
    data: {
      password: hashedPassword,
    },
  });
};
