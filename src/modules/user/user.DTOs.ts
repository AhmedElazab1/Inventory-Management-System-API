import z from 'zod';
import { paramsIdSchema, updateUserSchema, usersQuerySchema } from './user.validation';

export type UpdateUserDTO = z.infer<typeof updateUserSchema>;

export type IQueryStr = z.infer<typeof usersQuerySchema>;

export type ParamsIdDTO = z.infer<typeof paramsIdSchema>;
