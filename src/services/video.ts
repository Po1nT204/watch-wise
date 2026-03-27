import prisma from '@/config/prisma'; // Используем твой конфиг

export const getVideosByUserId = async (userId: string) => {
  try {
    // Ищем видео, которые связаны с пользователем через GeneratedContent
    // То есть: "Дай мне видео, у которых есть хотя бы одна генерация, принадлежащая этому юзеру"
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
          take: 1,
        },
      },
    });

    return videos;
  } catch (error) {
    console.error('Ошибка при получении видео:', error);
    return [];
  }
};

export const getVideoById = async (videoId: string, userId: string) => {
  try {
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

    return video;
  } catch (error) {
    console.error('Ошибка при получении видео:', error);
    return null;
  }
};

export const deleteVideoFromUser = async (videoId: string, userId: string) => {
  try {
    return await prisma.$transaction(async (tx) => {
      // 1. Удаляем прогресс
      await tx.videoProgress.deleteMany({
        where: { videoId, userId },
      });

      // 2. Удаляем сгенерированный контент (каскад удалит вопросы и карточки)
      await tx.generatedContent.deleteMany({
        where: { videoId, userId },
      });

      return { success: true };
    });
  } catch (error) {
    console.error('Delete Service Error:', error);
    throw new Error('Ошибка при удалении данных видео');
  }
};
