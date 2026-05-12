import { YoutubeTranscript } from 'youtube-transcript';
import prisma from '@/config/prisma';
import { logger } from '@/config/logger';

export class YoutubeService {
  /**
   * Получает транскрипт с YouTube и сохраняет его в базу данных как чанки.
   * Возвращает склеенный текст с таймкодами для передачи в LLM.
   */
  static async fetchAndSaveTranscript(videoUrl: string, videoId: string) {
    try {
      logger.info({ videoId, videoUrl }, 'Starting fetch YOUTUBE TRANSCRIPT');
      const transcriptItems = await YoutubeTranscript.fetchTranscript(
        videoUrl,
        {
          lang: 'ru',
        },
      );

      if (!transcriptItems || transcriptItems.length === 0) {
        throw new Error('Транскрипт пуст или не найден');
      }

      await prisma.transcriptChunk.createMany({
        data: transcriptItems.map((item) => ({
          videoId: videoId,
          startTime: item.offset / 1000,
          endTime: (item.offset + item.duration) / 1000,
          text: item.text,
        })),
      });

      const fullTextWithTimestamps = transcriptItems
        .map((item) => `[${Math.floor(item.offset / 1000)}s] ${item.text}`)
        .join(' ');

      logger.info(
        { videoId, transcriptLength: fullTextWithTimestamps.length },
        'Fetch YOUTUBE TRANSCRIPT completed',
      );
      return fullTextWithTimestamps;
    } catch (error) {
      logger.error(
        { err: error, videoId, videoUrl },
        'Fetch YOUTUBE TRANSCRIPT failed',
      );
      throw new Error('Не удалось получить субтитры для видео с youtube');
    }
  }
}
