'use server';

import { auth } from '@/config/auth';
import { logger } from '@/config/logger';
import prisma from '@/config/prisma';
import { revalidatePath } from 'next/cache';

export const saveQuizResult = async (
  contentId: string,
  videoId: string,
  score: number,
  total: number,
) => {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Не авторизован' };

  try {
    logger.info({ userId: session.user.id }, 'Starting SAVE QUIZ RESULT to DB');
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
    ]);

    revalidatePath('/dashboard');
    revalidatePath(`/dashboard/video/${videoId}`);

    logger.info(
      { userId: session.user.id, success: true },
      'SAVE QUIZ RESULT to DB completed',
    );
    return { success: true };
  } catch (error) {
    logger.error(
      { err: error, userId: session.user.id, success: false },
      'SAVE QUIZ RESULT to DB failed',
    );
    return { error: 'Ошибка сохранения результата' };
  }
};
