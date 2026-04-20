'use server';

import { auth } from '@/config/auth';
import { logger } from '@/config/logger';
import prisma from '@/config/prisma';
import { revalidatePath } from 'next/cache';

// Утилита для расчета уровня на основе XP (каждые 100 XP = 1 уровень)
const calculateLevel = (xp: number) => Math.floor(xp / 100) + 1;

export const saveQuizResult = async (
  contentId: string,
  videoId: string,
  score: number,
  total: number,
) => {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Не авторизован' };

  try {
    logger.info(
      { userId: session.user.id },
      'Starting SAVE QUIZ RESULT and XP update',
    );

    // 1. Получаем текущие данные пользователя для расчета геймификации
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { xp: true, level: true, streak: true, lastActiveAt: true },
    });

    if (!user) throw new Error('Пользователь не найден');

    // --- ЛОГИКА ГЕЙМИФИКАЦИИ ---
    // Начисляем 10 XP за каждый правильный ответ + 5 XP бонус за прохождение
    const earnedXp = score * 10 + 5;
    const newXp = user.xp + earnedXp;
    const newLevel = calculateLevel(newXp);

    // Логика Стриков (Дней подряд)
    let newStreak = user.streak;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Обнуляем время, оставляем только дату

    const lastActive = user.lastActiveAt ? new Date(user.lastActiveAt) : null;
    if (lastActive) lastActive.setHours(0, 0, 0, 0);

    if (!lastActive) {
      newStreak = 1; // Первый день активности
    } else {
      const diffTime = today.getTime() - lastActive.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        newStreak += 1; // Зашел на следующий день - стрик растет
      } else if (diffDays > 1) {
        newStreak = 1; // Пропустил день - стрик сбрасывается
      }
      // Если diffDays === 0, значит уже получал XP сегодня, стрик не меняется
    }

    // 2. Выполняем все обновления в одной транзакции (чтобы ничего не потерялось)
    await prisma.$transaction([
      prisma.testResult.create({
        data: {
          score,
          total,
          userId: session.user.id,
          contentId,
        },
      }),
      prisma.videoProgress.update({
        where: {
          userId_videoId: {
            userId: session.user.id,
            videoId: videoId,
          },
        },
        data: {
          isCompleted: true,
          updatedAt: new Date(),
        },
      }),
      prisma.user.update({
        where: { id: session.user.id },
        data: {
          xp: newXp,
          level: newLevel,
          streak: newStreak,
          lastActiveAt: new Date(),
        },
      }),
    ]);

    revalidatePath('/dashboard');
    revalidatePath(`/dashboard/video/${videoId}`);

    logger.info(
      { userId: session.user.id, earnedXp, newLevel, newStreak, success: true },
      'SAVE QUIZ RESULT and XP update completed',
    );

    // Возвращаем данные о прогрессе на фронт, чтобы показать красивый Toast
    return {
      success: true,
      earnedXp,
      newLevel,
      isLevelUp: newLevel > user.level,
    };
  } catch (error) {
    logger.error(
      { err: error, userId: session.user.id, success: false },
      'SAVE QUIZ RESULT to DB failed',
    );
    return { error: 'Ошибка сохранения результата' };
  }
};
