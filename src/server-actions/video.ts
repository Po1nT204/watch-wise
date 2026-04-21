'use server';

import { z } from 'zod';
import {
  VideoUrlSchema,
  QuizQuestionSchema,
  FlashcardSchema,
} from '@/shared/schemas';
import { auth } from '@/config/auth';
import prisma from '@/config/prisma';
import { parseVideoUrl } from '@/lib/utils';
import { revalidatePath } from 'next/cache';
import { YandexCloudService } from '@/services/yandex';
import { YoutubeService } from '@/services/youtube';
import { S3Service } from '@/services/s3';
import { SpeechKitService } from '@/services/speechkit';
import { VideoDownloader } from '@/services/video-downloader';
import { logger } from '@/config/logger';

interface AnalysisSettings {
  mode: string; // в будущем enum и импорт из файла types
  difficulty: string; // в будущем enum и импорт из файла types
  questionsCount: number;
  audience: string; // в будущем enum и импорт из файла types
  focus: string; // в будущем enum и импорт из файла types
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
    logger.info({ videoId: videoData.id }, 'Starting ADD VIDEO to DB');
    let videoTitle = `${videoData.platform.toUpperCase()} Video ${videoData.id}`;
    let thumbnail = '';

    if (videoData.platform === 'youtube') {
      thumbnail = `https://img.youtube.com/vi/${videoData.id}/maxresdefault.jpg`;

      try {
        const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoData.id}&format=json`;
        // Ждем максимум 3 секунды, чтобы не вешать сервер
        const response = await fetch(oembedUrl, {
          signal: AbortSignal.timeout(3000),
        });
        if (response.ok) {
          const metadata = await response.json();
          if (metadata.title) videoTitle = metadata.title;
        }
      } catch (e) {
        // Если YouTube недоступен, просто логируем warn и идем дальше с дефолтным названием
        logger.warn(
          { videoId: videoData.id },
          'YouTube oEmbed fetch timed out. Using default title.',
        );
      }
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
    logger.info(
      { videoId: videoData.id, success: true },
      'ADD VIDEO to DB completed',
    );
    return { success: 'Видео добавлено!', videoId: video.id };
  } catch (error) {
    logger.error(
      { err: error, videoId: videoData.id },
      'ADD VIDEO to DB failed',
    );
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
    logger.info({ videoId, settings }, 'Starting ANALYSIS VIDEO');
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
          logger.warn(
            { videoId: video.id, err: e },
            'YouTube transcript fetch failed. Falling back to audio extraction -> SpeechKit pipeline',
          );
          needsAudioExtraction = true; // Фоллбэк активирован
        }
      }

      // Общий пайплайн извлечения аудио и распознавания (VK + YouTube Fallback)
      if (needsAudioExtraction) {
        try {
          // 1. ЗАПУСКАЕМ СКАЧИВАНИЕ ПАРАЛЛЕЛЬНО (Audio + Video 480p)
          const [localAudioPath, localVideoPath] = await Promise.all([
            VideoDownloader.extractAudio(video.url, video.id),
            VideoDownloader.extractVideo(video.url, video.id, 480), // Ограничение в 480p
          ]);

          // 2. ЗАГРУЖАЕМ В S3 ПАРАЛЛЕЛЬНО
          const [s3AudioUrl, s3VideoUrl] = await Promise.all([
            S3Service.uploadAudio(localAudioPath, video.id),
            S3Service.uploadVideo(localVideoPath, video.id),
          ]);

          // Сохраняем ссылку на видео в БД, чтобы фронтенд мог её сразу использовать
          await prisma.video.update({
            where: { id: video.id },
            data: { cloudUrl: s3VideoUrl },
          });

          // 3. Отправляем АУДИО в SpeechKit
          const taskId = await SpeechKitService.createTask(s3AudioUrl);

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

          // 5. Парсим результат в чанки
          const parsedChunks = SpeechKitService.parseV3Response(result);
          if (parsedChunks.length === 0)
            throw new Error('SpeechKit вернул пустой результат');

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
          logger.error(
            { err: e, videoId: video.id },
            'Audio Extraction / SpeechKit Pipeline Error',
          );
          throw new Error(
            'Не удалось получить транскрипт (ни через субтитры, ни через аудио-распознавание) или загрузить видео',
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
        audience: settings.audience,
        focus: settings.focus,
      },
    );

    // Извлекаем контент и телеметрию
    const aiContent = aiResults.content;
    const aiTelemetry = aiResults.telemetry;

    const userId = session.user.id;
    if (!userId) throw new Error('User ID not found in session');

    await prisma.$transaction(async (tx) => {
      const generatedContent = await tx.generatedContent.create({
        data: {
          videoId: videoId,
          userId: userId,
          difficulty: settings.difficulty,
          mode: settings.mode,
          audience: settings.audience,
          focus: settings.focus,
          summary: aiContent.summary,
          latencyMs: aiTelemetry.latencyMs,
          tokensUsed: aiTelemetry.tokensUsed,
        },
      });

      if (aiContent.questions && aiContent.questions.length > 0) {
        await tx.quizQuestion.createMany({
          data: aiContent.questions.map(
            (q: z.infer<typeof QuizQuestionSchema>) => ({
              contentId: generatedContent.id,
              text: q.text,
              timestamp: q.timestamp || 0,
              options: q.options,
              correctIdx: q.correctIdx,
              explanation: q.explanation,
            }),
          ),
        });
      }

      if (aiContent.flashcards && aiContent.flashcards?.length > 0) {
        await tx.flashcard.createMany({
          data: aiContent.flashcards.map(
            (f: z.infer<typeof FlashcardSchema>) => ({
              contentId: generatedContent.id,
              term: f.term,
              definition: f.definition,
            }),
          ),
        });
      }

      if (aiContent.tags && aiContent.tags.length > 0) {
        const tagIds: string[] = [];

        for (const tagName of aiContent.tags) {
          const normalizedName =
            tagName.trim().charAt(0).toUpperCase() +
            tagName.trim().slice(1).toLowerCase();
          if (!normalizedName) continue;

          const tag = await tx.tag.upsert({
            where: {
              userId_name: {
                userId: userId,
                name: normalizedName,
              },
            },
            update: {},
            create: {
              name: normalizedName,
              userId: userId,
              color: '#6366f1',
            },
          });
          tagIds.push(tag.id);
        }

        if (tagIds.length > 0) {
          await tx.videoProgress.update({
            where: {
              userId_videoId: {
                userId: userId,
                videoId: videoId,
              },
            },
            data: {
              tags: {
                connect: tagIds.map((id) => ({ id })),
              },
            },
          });
        }
      }
    });

    await prisma.video.update({
      where: { id: videoId },
      data: { status: 'COMPLETED' },
    });

    revalidatePath(`/dashboard/video/${videoId}`);
    logger.info(
      { videoId, telemetry: aiTelemetry, success: true },
      'Analysis completed',
    );
    return { success: true };
  } catch (error: unknown) {
    logger.error({ err: error, videoId }, 'Analysis Global Error');
    await prisma.video.update({
      where: { id: videoId },
      data: { status: 'FAILED' },
    });
    return {
      error:
        error instanceof Error ? error.message : 'Неизвестная ошибка анализа',
    };
  }
};

export const deleteVideo = async (videoId: string) => {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Не авторизован' };

  try {
    logger.info({ videoId }, 'Starting DELETE VIDEO from DB');
    const { deleteVideoFromUser } = await import('@/services/video');
    await deleteVideoFromUser(videoId, session.user.id);

    revalidatePath('/dashboard');
    logger.info({ videoId, success: true }, 'DELETE VIDEO from DB completed');
    return { success: 'Видео удалено из вашей библиотеки' };
  } catch (error) {
    logger.error(
      { err: error, videoId, success: false },
      'DELETE VIDEO from DB failed',
    );
    return { error: 'Не удалось удалить видео' };
  }
};
