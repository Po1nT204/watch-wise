import prisma from '@/config/prisma';
import { YandexCloudService } from '@/services/yandex';
import { YoutubeService } from '@/services/youtube';
import { S3Service } from '@/services/s3';
import { SpeechKitService } from '@/services/speechkit';
import { VideoDownloader } from '@/services/video-downloader';
import { logger } from '@/config/logger';
import {
  AIInferenceResult,
  AnalysisSettings,
  VideoWithoutRelations,
} from '@/shared/types';
import { APP_CONFIG } from '@/constants/app';
import { z } from 'zod';
import { QuizQuestionSchema, FlashcardSchema } from '@/shared/schemas';

export class AnalysisOrchestrator {
  static async processVideo(
    videoId: string,
    userId: string,
    settings: AnalysisSettings,
  ) {
    logger.info(
      { videoId, settings },
      'Starting ANALYSIS VIDEO in Orchestrator',
    );

    await prisma.video.update({
      where: { id: videoId },
      data: { status: 'PROCESSING' },
    });

    const video = await prisma.video.findUnique({
      where: { id: videoId },
      include: { transcriptChunks: true },
    });

    if (!video) throw new Error('Видео не найдено');

    try {
      // 1. Получение транскрипта
      let contextText = '';

      if (video.transcriptChunks.length > 0) {
        contextText = video.transcriptChunks
          .map((c) => `[${Math.floor(c.startTime)}s] ${c.text}`)
          .join(' ');
      } else {
        let needsAudioExtraction = video.platform === 'vk';

        if (video.platform === 'youtube') {
          try {
            contextText = await YoutubeService.fetchAndSaveTranscript(
              video.url,
              video.id,
            );
          } catch (e) {
            logger.warn(
              { videoId: video.id, err: e },
              'YouTube transcript fetch failed. Falling back to audio extraction',
            );
            needsAudioExtraction = true;
          }
        }

        if (needsAudioExtraction) {
          contextText = await this.executeAudioExtractionPipeline(video);
        }
      }

      // 2. Генерация контента через YandexGPT
      const aiResults = await YandexCloudService.generateLearningContent(
        contextText,
        {
          difficulty: settings.difficulty,
          count: settings.questionsCount,
          audience: settings.audience,
          focus: settings.focus,
        },
      );

      // 3. Сохранение результатов в БД
      await this.saveResultsToDatabase(videoId, userId, settings, aiResults);

      await prisma.video.update({
        where: { id: videoId },
        data: { status: 'COMPLETED' },
      });

      logger.info(
        { videoId, success: true },
        'Analysis Orchestration completed',
      );
    } catch (error) {
      logger.error({ err: error, videoId }, 'Analysis Orchestration Failed');
      await prisma.video.update({
        where: { id: videoId },
        data: { status: 'FAILED' },
      });
      throw error;
    }
  }

  private static async executeAudioExtractionPipeline(
    video: VideoWithoutRelations,
  ): Promise<string> {
    try {
      const [localAudioPath, localVideoPath] = await Promise.all([
        VideoDownloader.extractAudio(video.url, video.id),
        VideoDownloader.extractVideo(video.url, video.id, 480),
      ]);

      const [s3AudioUrl, s3VideoUrl] = await Promise.all([
        S3Service.uploadAudio(localAudioPath, video.id),
        S3Service.uploadVideo(localVideoPath, video.id),
      ]);

      await prisma.video.update({
        where: { id: video.id },
        data: { cloudUrl: s3VideoUrl },
      });

      const taskId = await SpeechKitService.createTask(s3AudioUrl);

      let isDone = false;
      let result;
      while (!isDone) {
        await new Promise((r) =>
          setTimeout(r, APP_CONFIG.API.SPEECHKIT_POLLING_INTERVAL),
        );
        const status = await SpeechKitService.getTaskStatus(taskId);
        if (status.done) {
          isDone = true;
          result = await SpeechKitService.getRecognitionResult(taskId);
        }
      }

      const parsedChunks = SpeechKitService.parseV3Response(result);
      if (parsedChunks.length === 0)
        throw new Error('SpeechKit вернул пустой результат');

      await prisma.transcriptChunk.createMany({
        data: parsedChunks.map((c) => ({
          videoId: video.id,
          startTime: c.startTime,
          endTime: c.endTime,
          text: c.text,
        })),
      });

      return parsedChunks
        .map((c) => `[${Math.floor(c.startTime)}s] ${c.text}`)
        .join(' ');
    } catch (e) {
      logger.error(
        { err: e, videoId: video.id },
        'Audio Extraction / SpeechKit Pipeline Error',
      );
      throw new Error('Не удалось получить транскрипт или загрузить медиа');
    }
  }

  private static async saveResultsToDatabase(
    videoId: string,
    userId: string,
    settings: AnalysisSettings,
    aiResults: AIInferenceResult,
  ) {
    const { content: aiContent, telemetry: aiTelemetry } = aiResults;

    await prisma.$transaction(async (tx) => {
      const generatedContent = await tx.generatedContent.create({
        data: {
          videoId,
          userId,
          difficulty: settings.difficulty,
          mode: settings.mode,
          audience: settings.audience,
          focus: settings.focus,
          summary: aiContent.summary,
          latencyMs: aiTelemetry.latencyMs,
          tokensUsed: aiTelemetry.tokensUsed,
        },
      });

      if (aiContent.questions?.length > 0) {
        await tx.quizQuestion.createMany({
          data: aiContent.questions.map(
            (q: z.infer<typeof QuizQuestionSchema>) => ({
              contentId: generatedContent.id,
              text: q.text,
              timestamp: q.timestamp || 0,
              options: q.options,
              correctIdx: q.correctIdx,
              explanation: q.explanation,
            }),
          ),
        });
      }

      if (aiContent.flashcards?.length > 0) {
        await tx.flashcard.createMany({
          data: aiContent.flashcards.map(
            (f: z.infer<typeof FlashcardSchema>) => ({
              contentId: generatedContent.id,
              term: f.term,
              definition: f.definition,
            }),
          ),
        });
      }

      if (aiContent.tags?.length > 0) {
        const tagIds: string[] = [];
        for (const tagName of aiContent.tags) {
          const normalizedName =
            tagName.trim().charAt(0).toUpperCase() +
            tagName.trim().slice(1).toLowerCase();
          if (!normalizedName) continue;

          const tag = await tx.tag.upsert({
            where: { userId_name: { userId, name: normalizedName } },
            update: {},
            create: { name: normalizedName, userId, color: '#6366f1' },
          });
          tagIds.push(tag.id);
        }

        if (tagIds.length > 0) {
          await tx.videoProgress.update({
            where: { userId_videoId: { userId, videoId } },
            data: { tags: { connect: tagIds.map((id) => ({ id })) } },
          });
        }
      }
    });
  }
}
