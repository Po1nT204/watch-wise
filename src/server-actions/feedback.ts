'use server';

import { auth } from '@/config/auth';
import prisma from '@/config/prisma';
import { logger } from '@/config/logger';
import { AiFeedbackSchema } from '@/shared/schemas';

export const submitAiFeedback = async (values: {
  generatedContentId: string;
  isLiked: boolean;
  comment?: string | null;
}) => {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Не авторизован!' };
  }

  const validatedFields = AiFeedbackSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: 'Некорректные данные фидбека!' };
  }

  const { generatedContentId, isLiked, comment } = validatedFields.data;

  try {
    const feedback = await prisma.aiFeedback.create({
      data: {
        userId: session.user.id,
        generatedContentId,
        isLiked,
        comment,
      },
      include: {
        generatedContent: {
          select: {
            videoId: true,
          },
        },
      },
    });

    logger.info(
      {
        userId: session.user.id,
        videoId: feedback.generatedContent.videoId,
        generatedContentId,
        isLiked,
        comment: comment || null,
        context: 'RLHF_Feedback_Pipeline',
      },
      'AI Generation quality feedback received',
    );

    return {
      success:
        'Спасибо за ваш отзыв! Он поможет улучшить качество генерации ИИ.',
    };
  } catch (error) {
    logger.error(
      { err: error, userId: session.user.id, generatedContentId },
      'Failed to save AI feedback',
    );
    return { error: 'Ошибка отправки отзыва.' };
  }
};
