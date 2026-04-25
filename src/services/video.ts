import { logger } from '@/config/logger';
import prisma from '@/config/prisma';
import { APP_CONFIG } from '@/constants/app';

export const getVideosByUserId = async (userId: string) => {
  try {
    logger.info({ userId }, "Starting fetch USER'S VIDEOS from DB");
    // Ищем видео, которые связаны с пользователем через GeneratedContent
    const videos = await prisma.video.findMany({
      where: {
        OR: [
          // Видео, где есть сгенерированный контент пользователя
          {
            generatedContents: {
              some: {
                userId: userId,
              },
            },
          },
          // ИЛИ видео, которые пользователь начал смотреть/добавил (Progress)
          {
            progress: {
              some: {
                userId: userId,
              },
            },
          },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
      // Можем сразу подгрузить статус прогресса для этого юзера, чтобы показать на карточке
      include: {
        progress: {
          where: {
            userId: userId,
          },
          include: {
            tags: true,
          },
          take: 1,
        },
      },
    });

    logger.info(
      { userId, videosLength: videos.length },
      "Fetch USER'S VIDEOS from DB completed",
    );
    return videos;
  } catch (error) {
    logger.error({ err: error, userId }, "Fetch USER'S VIDEOS from DB failed");
    throw error;
  }
};

export const getVideoById = async (videoId: string, userId: string) => {
  try {
    logger.info({ videoId, userId }, 'Starting fetch VIDEO from DB');
    const video = await prisma.video.findFirst({
      where: {
        id: videoId,
        // Проверяем, что пользователь имеет отношение к этому видео
        // (либо есть прогресс, либо сгенерированный контент)
        OR: [
          { progress: { some: { userId } } },
          { generatedContents: { some: { userId } } },
        ],
      },
      include: {
        progress: {
          where: { userId },
          take: 1,
        },
        // Подтягиваем сгенерированный контент для этого юзера
        generatedContents: {
          where: { userId },
          include: {
            questions: true,
            flashcards: true,
          },
          take: 1,
        },
        transcriptChunks: {
          orderBy: {
            startTime: 'asc',
          },
        },
      },
    });

    logger.info(
      { videoId, userId, videoTitle: video?.title },
      'Fetch VIDEO from DB completed',
    );
    return video;
  } catch (error) {
    logger.error({ err: error, videoId, userId }, 'Fetch VIDEO from DB failed');
    throw error;
  }
};

export const deleteVideoFromUser = async (videoId: string, userId: string) => {
  try {
    logger.info({ videoId, userId }, 'Starting DELETE VIDEO from DB');
    return await prisma.$transaction(async (tx) => {
      // 1. Удаляем прогресс
      await tx.videoProgress.deleteMany({
        where: { videoId, userId },
      });

      // 2. Удаляем сгенерированный контент (каскад удалит вопросы и карточки)
      await tx.generatedContent.deleteMany({
        where: { videoId, userId },
      });

      logger.info(
        { videoId, userId, success: true },
        'DELETE VIDEO from DB completed',
      );
      return { success: true };
    });
  } catch (error) {
    logger.error(
      { err: error, videoId, userId },
      'DELETE VIDEO from DB failed',
    );
    throw new Error('Ошибка при удалении данных видео');
  }
};

export const addVideoToLibrary = async (
  url: string,
  platform: 'youtube' | 'vk',
  externalId: string,
  userId: string,
) => {
  let videoTitle = `${platform.toUpperCase()} Video ${externalId}`;
  let thumbnail = '';

  if (platform === 'youtube') {
    thumbnail = `https://img.youtube.com/vi/${externalId}/maxresdefault.jpg`;
    try {
      const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${externalId}&format=json`;
      const response = await fetch(oembedUrl, {
        signal: AbortSignal.timeout(APP_CONFIG.API.YOUTUBE_FETCH_TIMEOUT),
      });
      if (response.ok) {
        const metadata = await response.json();
        if (metadata.title) videoTitle = metadata.title;
      }
    } catch (error) {
      logger.warn(
        { err: error, videoId: externalId },
        'YouTube oEmbed fetch timed out.',
      );
    }
  }

  // Создаем или обновляем видео в глобальной базе
  const video = await prisma.video.upsert({
    where: { url },
    update: {},
    create: {
      url,
      platform,
      externalId,
      thumbnail,
      title: videoTitle,
      status: 'PENDING',
    },
  });

  // Привязываем видео к конкретному пользователю
  await prisma.videoProgress.upsert({
    where: {
      userId_videoId: { userId, videoId: video.id },
    },
    update: { updatedAt: new Date() },
    create: {
      userId,
      videoId: video.id,
      timestamp: 0,
      isCompleted: false,
    },
  });

  return video.id;
};
