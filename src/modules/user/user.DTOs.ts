import z from 'zod';
import {
  changePasswordSchema,
  paramsIdSchema,
  resetPasswordSchema,
  updateUserSchema,
  usersQuerySchema,
} from './user.validation';

export type UpdateUserDTO = z.infer<typeof updateUserSchema>;

export type IQueryStr = z.infer<typeof usersQuerySchema>;

export type ParamsIdDTO = z.infer<typeof paramsIdSchema>;

export type ChangePasswordDTO = z.infer<typeof changePasswordSchema>;

export type ResetPasswordDTO = z.infer<typeof resetPasswordSchema>;
