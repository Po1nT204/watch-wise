'use server';

import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { AuthError } from 'next-auth';
import { signIn } from '@/config/auth';
import prisma from '@/config/prisma';
import { LoginSchema, RegisterSchema } from '@/shared/schemas';
import { logger } from '@/config/logger'; // <-- Импорт логгера

// --- Регистрация ---
export const registerUser = async (values: z.infer<typeof RegisterSchema>) => {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    // Логируем как предупреждение (warn), передаем email (если он там был) для контекста
    logger.warn({ email: values.email }, 'Registration validation failed');
    return { error: 'Неверные данные!' };
  }

  const { email, password, name } = validatedFields.data;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    logger.warn({ email }, 'Registration failed: User already exists');
    return { error: 'Email уже используется!' };
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    logger.info({ email }, 'User successfully registered');
    return { success: 'Пользователь создан! Теперь войдите в систему.' };
  } catch (error) {
    logger.error(
      { err: error, email },
      'Registration failed due to database error',
    );
    return { error: 'Внутренняя ошибка сервера' };
  }
};

// --- Вход ---
export const loginUser = async (values: z.infer<typeof LoginSchema>) => {
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    logger.warn({ email: values.email }, 'Login validation failed');
    return { error: 'Неверные данные!' };
  }

  const { email, password } = validatedFields.data;

  try {
    logger.info({ email }, 'Login attempt initiated');

    await signIn('credentials', {
      email,
      password,
      redirectTo: '/dashboard',
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          logger.warn({ email }, 'Login failed: Invalid credentials');
          return { error: 'Неверный Email или пароль!' };
        default:
          logger.error(
            { err: error, email },
            'Login failed: NextAuth internal error',
          );
          return { error: 'Что-то пошло не так!' };
      }
    }
    throw error;
  }
};
