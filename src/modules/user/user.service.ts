import { UserRequestDTO, UserResponseDTO } from '../auth/auth.DTOs';
import { hashPassword } from '../auth/services/token.service';
import prisma from '../../config/prisma';
import { Role } from '../../../generated/client/enums';
import { sanitizeUser } from '../auth/auth.mappers';
import { IQueryStr } from './user.DTOs';
import { paginate, parseQueryParams, PaginatedResult } from '../../common/utils/APIFeatures';

export const createUserService = async (data: UserRequestDTO): Promise<UserResponseDTO> => {
  const { name, email, password } = data;

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
