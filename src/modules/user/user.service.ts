import { UserRequestDTO, UserResponseDTO } from '../auth/auth.DTOs';
import { hashPassword } from '../auth/services/token.service';
import prisma from '../../config/prisma';
import { Role } from '../../../generated/client/enums';
import { sanitizeUser } from '../auth/auth.mappers';
import { IQueryStr, UpdateUserDTO, ParamsIdDTO } from './user.DTOs';
import { paginate, parseQueryParams, PaginatedResult } from '../../common/utils/APIFeatures';
import ApiError from '../../common/utils/ApiError';
import { STATUS_CODE } from '../../common/constants/constants';

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
  const result = await paginate(prisma.user, options);

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
