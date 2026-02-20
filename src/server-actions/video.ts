'use server';

import { z } from 'zod';
import { VideoUrlSchema } from '@/shared/schemas';
import { auth } from '@/config/auth'; // Твой конфиг
import prisma from '@/config/prisma';
import {
  getYoutubeVideoId,
  getYoutubeThumbnail,
  parseVideoUrl,
} from '@/lib/utils';
import { revalidatePath } from 'next/cache';

interface AnalysisSettings {
  mode: string; // в будущем enum и импорт из файла types
  difficulty: string; // в будущем enum и импорт из файла types
  questionsCount: number;
}

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
  const videoData = parseVideoUrl(url);

  if (!videoData)
    return { error: 'Не удалось определить ID видео или платформу' };

  try {
    let videoTitle = `${videoData.platform.toUpperCase()} Video ${videoData.id}`;
    let thumbnail = '';

    if (videoData.platform === 'youtube') {
      const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoData.id}&format=json`;
      const response = await fetch(oembedUrl);
      const metadata = response.ok ? await response.json() : null;
      if (metadata) videoTitle = metadata.title;
      thumbnail = `https://img.youtube.com/vi/${videoData.id}/maxresdefault.jpg`;
    }
    // Для VK метаданные без API ключа получить сложно, пока оставим заглушку названия

    const video = await prisma.video.upsert({
      where: { url },
      update: {},
      create: {
        url,
        platform: videoData.platform,
        externalId: videoData.id,
        thumbnail: thumbnail,
        title: videoTitle,
        status: 'PENDING',
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

export const startAnalysis = async (
  videoId: string,
  settings: AnalysisSettings,
) => {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Не авторизован' };

  try {
    // Импортируем наш мок-сервис
    const { simulateVideoAnalysis } = await import('@/services/ai-mock');

    // Передаем настройки внутрь
    await simulateVideoAnalysis(videoId, session.user.id, settings);

    revalidatePath(`/dashboard/video/${videoId}`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Ошибка анализа' };
  }
};

export const deleteVideo = async (videoId: string) => {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Не авторизован' };

  try {
    const { deleteVideoFromUser } = await import('@/services/video');
    await deleteVideoFromUser(videoId, session.user.id);

    revalidatePath('/dashboard');
    return { success: 'Видео удалено из вашей библиотеки' };
  } catch (error) {
    console.error(error);
    return { error: 'Не удалось удалить видео' };
  }
};
