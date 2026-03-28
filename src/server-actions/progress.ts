'use server';

import { auth } from '@/config/auth';
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

    return { success: true };
  } catch (error) {
    console.error('Save Quiz Result Error:', error);
    return { error: 'Ошибка сохранения результата' };
  }
};
