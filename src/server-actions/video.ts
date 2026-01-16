'use server';

import { z } from 'zod';
import { VideoUrlSchema } from '@/shared/schemas';
import { auth } from '@/config/auth'; // Твой конфиг
import prisma from '@/config/prisma';
import { getYoutubeVideoId, getYoutubeThumbnail } from '@/lib/utils';
import { revalidatePath } from 'next/cache';

export const addVideo = async (values: z.infer<typeof VideoUrlSchema>) => {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: 'Не авторизован!' };
  }

  const validatedFields = VideoUrlSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Некорректная ссылка!' };
  }

  const { url } = validatedFields.data;
  const videoId = getYoutubeVideoId(url);

  if (!videoId) {
    return { error: 'Не удалось определить ID видео' };
  }

  try {
    // 1. Создаем или обновляем само видео в базе (Video)
    // Мы пока не знаем название (Title), его парсинг сделаем позже или клиент сам подтянет.
    // Пока запишем URL и ID.
    const video = await prisma.video.upsert({
      where: { url: url },
      update: {}, // Если видео есть, ничего не меняем пока
      create: {
        url,
        platform: 'youtube',
        externalId: videoId,
        thumbnail: getYoutubeThumbnail(videoId),
        title: `YouTube Video ${videoId}`, // Временное название, потом заменим на реальное
      },
    });

    // 2. Связываем видео с пользователем через VideoProgress
    // Это нужно, чтобы видео появилось в "Моих видео"
    await prisma.videoProgress.upsert({
      where: {
        userId_videoId: {
          userId: session.user.id,
          videoId: video.id,
        },
      },
      update: {
        updatedAt: new Date(), // Обновляем дату, чтобы оно поднялось вверх списка
      },
      create: {
        userId: session.user.id,
        videoId: video.id,
        timestamp: 0,
        isCompleted: false,
      },
    });

    // 3. Обновляем кэш страницы дашборда, чтобы список обновился мгновенно
    revalidatePath('/dashboard');

    return { success: 'Видео добавлено!', videoId: video.id };
  } catch (error) {
    console.error('Add video error:', error);
    return { error: 'Ошибка при добавлении видео' };
  }
};
