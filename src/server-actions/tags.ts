'use server';

import { auth } from '@/config/auth';
import prisma from '@/config/prisma';
import { revalidatePath } from 'next/cache';
import { logger } from '@/config/logger';

export const getUserTags = async () => {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Не авторизован' };

  try {
    const tags = await prisma.tag.findMany({
      where: { userId: session.user.id },
      orderBy: { name: 'asc' },
    });
    return { tags };
  } catch (error) {
    logger.error(
      { err: error, userId: session.user.id },
      'Error fetching tags',
    );
    return { error: 'Ошибка при получении тегов' };
  }
};

export const createTag = async (name: string, color?: string) => {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Не авторизован' };

  if (!name || name.trim().length === 0) {
    return { error: 'Имя тега не может быть пустым' };
  }

  try {
    const tag = await prisma.tag.create({
      data: {
        name: name.trim(),
        color: color || '#6366f1', // Дефолтный цвет (indigo-500)
        userId: session.user.id,
      },
    });
    revalidatePath('/dashboard/videos');
    return { success: true, tag };
  } catch (error) {
    logger.error({ err: error, userId: session.user.id }, 'Error creating tag');
    return {
      error: 'Ошибка при создании тега (возможно, такое имя уже существует)',
    };
  }
};

export const deleteTag = async (tagId: string) => {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Не авторизован' };

  try {
    await prisma.tag.delete({
      where: {
        id: tagId,
        userId: session.user.id, // Защита: удаляем только если тег принадлежит юзеру
      },
    });
    revalidatePath('/dashboard/videos');
    return { success: true };
  } catch (error) {
    logger.error(
      { err: error, tagId, userId: session.user.id },
      'Error deleting tag',
    );
    return { error: 'Ошибка при удалении тега' };
  }
};

export const toggleVideoTag = async (
  videoId: string,
  tagId: string,
  isConnecting: boolean,
) => {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Не авторизован' };

  try {
    const action = isConnecting
      ? { connect: { id: tagId } }
      : { disconnect: { id: tagId } };

    // Мы привязываем тег к VideoProgress, так как это связь конкретного юзера с видео
    await prisma.videoProgress.update({
      where: {
        userId_videoId: {
          userId: session.user.id,
          videoId: videoId,
        },
      },
      data: {
        tags: action,
      },
    });

    revalidatePath('/dashboard/videos');
    return { success: true };
  } catch (error) {
    logger.error(
      { err: error, videoId, tagId, userId: session.user.id },
      'Error toggling video tag',
    );
    return { error: 'Ошибка при изменении тегов видео' };
  }
};
