'use server';

import { z } from 'zod';
import { auth } from '@/config/auth';
import prisma from '@/config/prisma';
import { revalidatePath } from 'next/cache';
import { logger } from '@/config/logger';
import { EditQuestionSchema } from '@/shared/schemas';

export const updateQuizQuestion = async (
  values: z.infer<typeof EditQuestionSchema>,
) => {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Не авторизован' };

  const validatedFields = EditQuestionSchema.safeParse(values);
  if (!validatedFields.success) {
    logger.warn(
      { userId: session.user.id, errors: validatedFields.error.flatten() },
      'Quiz question update validation failed',
    );
    return { error: 'Некорректные данные' };
  }

  const { id, videoId, text, timestamp, options, correctIdx, explanation } =
    validatedFields.data;

  try {
    // Безопасность: проверяем, существует ли вопрос и принадлежит ли он пользователю
    const question = await prisma.quizQuestion.findUnique({
      where: { id },
      include: { content: true },
    });

    if (!question || question.content.userId !== session.user.id) {
      logger.warn(
        { userId: session.user.id, questionId: id },
        'Unauthorized quiz edit attempt',
      );
      return { error: 'Нет прав для редактирования этого вопроса' };
    }

    await prisma.quizQuestion.update({
      where: { id },
      data: {
        text,
        timestamp,
        options,
        correctIdx,
        explanation,
      },
    });

    revalidatePath(`/dashboard/video/${videoId}`);
    logger.info(
      { userId: session.user.id, questionId: id },
      'Quiz question updated',
    );

    return { success: true };
  } catch (error) {
    logger.error(
      { err: error, userId: session.user.id, questionId: id },
      'Failed to update quiz question',
    );
    return { error: 'Внутренняя ошибка при обновлении вопроса' };
  }
};

export const deleteQuizQuestion = async (id: string, videoId: string) => {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Не авторизован' };

  try {
    // Безопасность: проверка прав владения перед удалением
    const question = await prisma.quizQuestion.findUnique({
      where: { id },
      include: { content: true },
    });

    if (!question || question.content.userId !== session.user.id) {
      logger.warn(
        { userId: session.user.id, questionId: id },
        'Unauthorized quiz delete attempt',
      );
      return { error: 'Нет прав для удаления этого вопроса' };
    }

    await prisma.quizQuestion.delete({
      where: { id },
    });

    revalidatePath(`/dashboard/video/${videoId}`);
    logger.info(
      { userId: session.user.id, questionId: id },
      'Quiz question deleted',
    );

    return { success: true };
  } catch (error) {
    logger.error(
      { err: error, userId: session.user.id, questionId: id },
      'Failed to delete quiz question',
    );
    return { error: 'Внутренняя ошибка при удалении вопроса' };
  }
};
