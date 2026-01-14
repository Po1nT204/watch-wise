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
