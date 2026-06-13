import z from 'zod';

export const updateUserSchema = z
  .object({
    name: z
      .string()
      .min(3, 'Name must be at least 3 characters')
      .max(50, 'Name must be less than 50 characters')
      .transform((value) => {
        return value.trim();
      })
      .optional(),
    email: z
      .string({ error: 'Email must be a string' })
      .email('Invalid email format')
      .max(50, 'Email must be less than 50 characters')
      .transform((value) => {
        return value.trim();
      })
      .optional(),
    password: z
      .string({ error: 'Password must be a string' })
      .min(8, 'Password must be at least 8 characters')
      .max(50, 'Password must be less than 50 characters')
      .transform((value) => {
        return value.trim();
      })
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

export const paramsIdSchema = z.object({
  id: z.string().cuid('Invalid user ID'),
});

export const usersQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  sort: z.string().optional(),
  fields: z.string().optional(),
  search: z.string().optional(),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string(),
  newPassword: z.string().min(8).max(50),
});

export const resetPasswordSchema = z.object({
  newPassword: z.string().min(8).max(50),
});
