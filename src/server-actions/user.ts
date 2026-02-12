'use server';

import { auth } from '@/config/auth';
import prisma from '@/config/prisma';
import { SettingsSchema } from '@/shared/schemas';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

export const updateUserSettings = async (
  values: z.infer<typeof SettingsSchema>,
) => {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Не авторизован' };

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: values.name,
        bio: values.bio,
        age: values.age,
        links: values.links,
      },
    });

    revalidatePath('/dashboard/settings');
    return { success: 'Профиль обновлен!' };
  } catch (error) {
    console.error(error);
    return { error: 'Ошибка при сохранении' };
  }
};
