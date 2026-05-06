'use server';

import { auth } from '@/config/auth';
import { logger } from '@/config/logger';
import prisma from '@/config/prisma';
import { APP_CONFIG } from '@/constants/app';
import { revalidatePath } from 'next/cache';

const calculateLevel = (xp: number) =>
  Math.floor(xp / APP_CONFIG.GAMIFICATION.XP_PER_LEVEL) + 1;

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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { xp: true, level: true, streak: true, lastActiveAt: true },
    });

    if (!user) throw new Error('Пользователь не найден');

    const earnedXp =
      score * APP_CONFIG.GAMIFICATION.XP_PER_CORRECT_ANSWER +
      APP_CONFIG.GAMIFICATION.XP_COMPLETION_BONUS;
    const newXp = user.xp + earnedXp;
    const newLevel = calculateLevel(newXp);

    let newStreak = user.streak;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastActive = user.lastActiveAt ? new Date(user.lastActiveAt) : null;
    if (lastActive) lastActive.setHours(0, 0, 0, 0);

    if (!lastActive) {
      newStreak = 1;
    } else {
      const diffTime = today.getTime() - lastActive.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        newStreak += 1;
      } else if (diffDays > 1) {
        newStreak = 1;
      }
    }

    await prisma.$transaction([
      prisma.testResult.create({
        data: {
          score,
          total,
          userId: session.user.id,
          contentId,
        },
      }),
      prisma.xpLog.create({
        data: {
          userId: session.user.id,
          amount: earnedXp,
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
