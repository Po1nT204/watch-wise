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
import { YandexCloudService } from '@/services/yandex';

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

// export const startAnalysis = async (
//   videoId: string,
//   settings: AnalysisSettings,
// ) => {
//   const session = await auth();
//   if (!session?.user?.id) return { error: 'Не авторизован' };

//   try {
//     // Импортируем наш мок-сервис
//     const { simulateVideoAnalysis } = await import('@/services/ai-mock');

//     // Передаем настройки внутрь
//     await simulateVideoAnalysis(videoId, session.user.id, settings);

//     revalidatePath(`/dashboard/video/${videoId}`);
//     return { success: true };
//   } catch (error) {
//     console.error(error);
//     return { error: 'Ошибка анализа' };
//   }
// };
export const startAnalysis = async (
  videoId: string,
  settings: AnalysisSettings,
) => {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Не авторизован' };

  try {
    // 1. Ставим статус "В обработке", чтобы юзер видел лоадер
    await prisma.video.update({
      where: { id: videoId },
      data: { status: 'PROCESSING' },
    });
    revalidatePath(`/dashboard/video/${videoId}`);

    // 2. Получаем данные видео (нам нужен заголовок или транскрипт)
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      include: { transcriptChunks: true },
    });

    if (!video) return { error: 'Видео не найдено' };

    // Подготавливаем текст для анализа.
    // Если SpeechKit еще нет, используем Title + описание как временный контекст
    const contextText =
      video.transcriptChunks.length > 0
        ? video.transcriptChunks.map((c) => c.text).join(' ')
        : `Название видео: ${video.title}. Проанализируй содержание исходя из темы.`;

    // 3. Вызываем реальный YandexGPT
    const aiResults = await YandexCloudService.generateLearningContent(
      contextText,
      {
        difficulty: settings.difficulty,
        count: settings.questionsCount,
      },
    );

    // 4. Сохраняем результаты в базу (Транзакция, чтобы всё сохранилось вместе)
    await prisma.$transaction(async (tx) => {
      const generatedContent = await tx.generatedContent.create({
        data: {
          videoId: videoId,
          userId: session.user.id,
          difficulty: settings.difficulty,
          mode: settings.mode,
          summary: aiResults.summary,
        },
      });

      // Создаем вопросы, привязанные к этому контенту
      if (aiResults.questions && aiResults.questions.length > 0) {
        await tx.quizQuestion.createMany({
          data: aiResults.questions.map((q: any) => ({
            contentId: generatedContent.id,
            text: q.text,
            timestamp: q.timestamp || 0,
            options: q.options,
            correctIdx: q.correctIdx,
            explanation: q.explanation,
          })),
        });
      }
    });

    // 5. Завершаем: статус "Готово"
    await prisma.video.update({
      where: { id: videoId },
      data: { status: 'COMPLETED' },
    });

    revalidatePath(`/dashboard/video/${videoId}`);
    return { success: true };
  } catch (error) {
    console.error('Analysis Error:', error);

    // Если упало — ставим статус FAILED, чтобы кнопка снова стала активной
    await prisma.video.update({
      where: { id: videoId },
      data: { status: 'FAILED' },
    });

    return {
      error: 'Ошибка нейросети. Проверьте API ключи или баланс Yandex Cloud.',
    };
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
