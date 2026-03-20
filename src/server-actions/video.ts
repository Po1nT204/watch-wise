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
import { YoutubeTranscript } from 'youtube-transcript';

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
    await prisma.video.update({
      where: { id: videoId },
      data: { status: 'PROCESSING' },
    });
    revalidatePath(`/dashboard/video/${videoId}`);

    const video = await prisma.video.findUnique({
      where: { id: videoId },
      include: { transcriptChunks: true },
    });

    if (!video) return { error: 'Видео не найдено' };

    // 2. Логика получения транскрипта
    let finalTranscriptWithTimestamps = '';

    // Если в базе уже есть чанки (например, загрузили ранее), используем их
    if (video.transcriptChunks.length > 0) {
      // Если берем из базы
      finalTranscriptWithTimestamps = video.transcriptChunks
        .map((c) => `[${Math.floor(c.startTime)}s] ${c.text}`)
        .join(' ');
    }
    // Если это YouTube и в базе пусто — тянем через библиотеку
    else if (video.platform === 'youtube') {
      try {
        const transcriptItems = await YoutubeTranscript.fetchTranscript(
          video.url,
          {
            lang: 'ru', // Пытаемся взять русский
          },
        );

        finalTranscriptWithTimestamps = transcriptItems
          .map((item) => `[${Math.floor(item.offset / 1000)}s] ${item.text}`)
          .join(' ');

        // [Опционально] Сохраняем полученные чанки в базу, чтобы не скачивать их снова
        await prisma.transcriptChunk.createMany({
          data: transcriptItems.map((item) => ({
            videoId: video.id,
            startTime: item.offset / 1000, // библиотека отдает в мс
            endTime: (item.offset + item.duration) / 1000,
            text: item.text,
          })),
        });
      } catch (e) {
        console.error('DEBUG YOUTUBE ERROR:', e);
        console.warn(
          'Не удалось получить субтитры YouTube, используем метаданные',
        );
      }
    }

    // Если всё еще пусто — используем название как запасной вариант
    const contextText =
      finalTranscriptWithTimestamps ||
      `Название видео: ${video.title}. Проанализируй содержание`;

    // 3. Вызываем реальный YandexGPT
    const aiResults = await YandexCloudService.generateLearningContent(
      contextText,
      {
        difficulty: settings.difficulty,
        count: settings.questionsCount,
      },
    );

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

    await prisma.video.update({
      where: { id: videoId },
      data: { status: 'COMPLETED' },
    });

    revalidatePath(`/dashboard/video/${videoId}`);
    return { success: true };
  } catch (error) {
    console.error('Analysis Error:', error);
    await prisma.video.update({
      where: { id: videoId },
      data: { status: 'FAILED' },
    });

    return {
      error: 'Ошибка анализа контента. Попробуйте позже.',
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
