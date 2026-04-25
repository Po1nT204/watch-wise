'use server';

import { z } from 'zod';
import { VideoUrlSchema } from '@/shared/schemas';
import { auth } from '@/config/auth';
import { parseVideoUrl } from '@/lib/utils';
import { revalidatePath } from 'next/cache';
import { logger } from '@/config/logger';
import { AnalysisSettings } from '@/shared/types';
import { deleteVideoFromUser, addVideoToLibrary } from '@/services/video';
import { AnalysisOrchestrator } from '@/services/analysis-orchestrator';

export const addVideo = async (values: z.infer<typeof VideoUrlSchema>) => {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Не авторизован!' };

  const validatedFields = VideoUrlSchema.safeParse(values);
  if (!validatedFields.success) return { error: 'Некорректная ссылка!' };

  const { url } = validatedFields.data;
  const videoData = parseVideoUrl(url);

  if (!videoData)
    return { error: 'Не удалось определить ID видео или платформу' };

  try {
    const videoId = await addVideoToLibrary(
      url,
      videoData.platform,
      videoData.id,
      session.user.id,
    );

    revalidatePath('/dashboard');
    return { success: 'Видео добавлено!', videoId };
  } catch (error) {
    logger.error({ err: error, url }, 'Action ADD VIDEO failed');
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
    await AnalysisOrchestrator.processVideo(videoId, session.user.id, settings);
    revalidatePath(`/dashboard/video/${videoId}`);
    return { success: true };
  } catch (error: unknown) {
    revalidatePath(`/dashboard/video/${videoId}`);
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
    await deleteVideoFromUser(videoId, session.user.id);
    revalidatePath('/dashboard');
    return { success: 'Видео удалено из вашей библиотеки' };
  } catch (error) {
    logger.error({ err: error, videoId }, 'Action DELETE VIDEO failed');
    return { error: 'Не удалось удалить видео' };
  }
};
