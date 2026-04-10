'use server';

import { auth } from '@/config/auth';
import { logger } from '@/config/logger';
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
    logger.info({ userId: session.user.id }, 'Starting UPDATE SETTINGS');
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: values.name,
        bio: values.bio,
        age: values.age,
        location: values.location,
        links: values.links ? { url: values.links } : {},
      },
    });

    revalidatePath('/dashboard/settings');
    logger.info(
      { userId: session.user.id, success: true },
      'UPDATE USER SETTINGS completed',
    );
    return { success: 'Профиль обновлен!' };
  } catch (error) {
    logger.error(
      { err: error, userId: session.user.id, success: false },
      'UPDATE USER SETTINGS failed',
    );
    return { error: 'Ошибка при сохранении' };
  }
};
