'use server';

import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { AuthError } from 'next-auth';
import { signIn } from '@/config/auth'; // Импорт из нашего конфига
import prisma from '@/config/prisma';
import { LoginSchema, RegisterSchema } from '@/shared/schemas';

// --- Регистрация ---
export const registerUser = async (values: z.infer<typeof RegisterSchema>) => {
  // 1. Валидация на сервере
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Неверные данные!' };
  }

  const { email, password, name } = validatedFields.data;

  // 2. Проверка существования пользователя
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { error: 'Email уже используется!' };
  }

  // 3. Хеширование пароля
  const hashedPassword = await bcrypt.hash(password, 10);

  // 4. Создание пользователя
  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  return { success: 'Пользователь создан! Теперь войдите в систему.' };
};

// --- Вход ---
export const loginUser = async (values: z.infer<typeof LoginSchema>) => {
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Неверные данные!' };
  }

  const { email, password } = validatedFields.data;

  try {
    // Вызываем NextAuth signIn.
    // redirect: false нужен, чтобы обработать ошибку тут, а не ловить редирект
    await signIn('credentials', {
      email,
      password,
      redirectTo: '/dashboard', // Куда отправить после входа
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'Неверный Email или пароль!' };
        default:
          return { error: 'Что-то пошло не так!' };
      }
    }
    throw error; // Обязательно пробрасываем редирект-ошибку дальше
  }
};
