import { z } from 'zod';

export const RegisterSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Имя должно содержать минимум 2 символа' }),
  email: z.string().email({ message: 'Введите корректный Email' }),
  password: z
    .string()
    .min(6, { message: 'Пароль должен быть не менее 6 символов' }),
});

export const LoginSchema = z.object({
  email: z.string().email({ message: 'Введите корректный Email' }),
  password: z.string().min(1, { message: 'Введите пароль' }),
});

export const VideoUrlSchema = z.object({
  url: z
    .string()
    .min(1, { message: 'Введите ссылку' })
    .url({ message: 'Введите корректный URL' })
    .regex(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/, {
      message: 'Поддерживаются только ссылки на YouTube',
    }),
});
