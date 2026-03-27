'use server';

import { z } from 'zod';
import { VideoUrlSchema } from '@/shared/schemas';
import { auth } from '@/config/auth'; // Твой конфиг
import prisma from '@/config/prisma';
import { parseVideoUrl } from '@/lib/utils';
import { revalidatePath } from 'next/cache';
import { YandexCloudService } from '@/services/yandex';
import { YoutubeService } from '@/services/youtube';
import { S3Service } from '@/services/s3';
import { SpeechKitService } from '@/services/speechkit';
import { VideoDownloader } from '@/services/video-downloader';

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
    let contextText = '';

    // Если в базе уже есть чанки (например, загрузили ранее), используем их
    if (video.transcriptChunks.length > 0) {
      // Если берем из базы
      contextText = video.transcriptChunks
        .map((c) => `[${Math.floor(c.startTime)}s] ${c.text}`)
        .join(' ');
    } else {
      // Флаг, указывающий, нужно ли нам прогонять аудио через SpeechKit
      let needsAudioExtraction = video.platform === 'vk';

      // Если это YouTube, сначала пробуем быстро получить субтитры
      if (video.platform === 'youtube') {
        try {
          contextText = await YoutubeService.fetchAndSaveTranscript(
            video.url,
            video.id,
          );
        } catch (e) {
          console.warn(
            `[YouTube] Нет субтитров для ${video.id}. Включаем резервный пайплайн (аудио -> SpeechKit)...`,
          );
          needsAudioExtraction = true; // Фоллбэк активирован
        }
      }

      // Общий пайплайн извлечения аудио и распознавания (VK + YouTube Fallback)
      if (needsAudioExtraction) {
        try {
          // 1. Извлекаем аудио локально
          const localPath = await VideoDownloader.extractAudio(
            video.url,
            video.id,
          );

          // 2. Загружаем в S3
          const s3Url = await S3Service.uploadAudio(localPath, video.id);

          // 3. Создаем задачу в SpeechKit
          const taskId = await SpeechKitService.createTask(s3Url);

          // 4. Polling (опрос)
          let isDone = false;
          let result;
          while (!isDone) {
            await new Promise((r) => setTimeout(r, 5000)); // Ждем 5 сек
            const status = await SpeechKitService.getTaskStatus(taskId);
            if (status.done) {
              isDone = true;
              result = await SpeechKitService.getRecognitionResult(taskId);
            }
          }

          // 5. Парсим результат в наши чанки
          const parsedChunks = SpeechKitService.parseV3Response(result);

          if (parsedChunks.length === 0) {
            throw new Error('SpeechKit вернул пустой результат');
          }

          // 6. Сохраняем чанки в БД (чтобы потом не перерасходовать деньги на SpeechKit)
          await prisma.transcriptChunk.createMany({
            data: parsedChunks.map((c) => ({
              videoId: video.id,
              startTime: c.startTime,
              endTime: c.endTime,
              text: c.text,
            })),
          });

          // 7. Формируем текст для GPT
          contextText = parsedChunks
            .map((c) => `[${Math.floor(c.startTime)}s] ${c.text}`)
            .join(' ');
        } catch (e) {
          console.error('Audio Extraction / SpeechKit Pipeline Error:', e);
          throw new Error(
            'Не удалось получить транскрипт (ни через субтитры, ни через аудио-распознавание)',
          );
        }
      }
    }
    // 3. Вызываем YandexGPT
    const aiResults = await YandexCloudService.generateLearningContent(
      contextText,
      {
        difficulty: settings.difficulty,
        count: settings.questionsCount,
      },
    );

    const userId = session.user.id;
    if (!userId) throw new Error('User ID not found in session');

    await prisma.$transaction(async (tx) => {
      const generatedContent = await tx.generatedContent.create({
        data: {
          videoId: videoId,
          userId: userId,
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

      if (aiResults.flashcards && aiResults.flashcards?.length > 0) {
        await tx.flashcard.createMany({
          data: aiResults.flashcards.map((f: any) => ({
            contentId: generatedContent.id,
            term: f.term,
            definition: f.definition,
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
