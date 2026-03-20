import { YoutubeTranscript } from 'youtube-transcript';
import prisma from '@/config/prisma';

export class YoutubeService {
  /**
   * Получает транскрипт с YouTube и сохраняет его в базу данных как чанки.
   * Возвращает склеенный текст с таймкодами для передачи в LLM.
   */
  static async fetchAndSaveTranscript(videoUrl: string, videoId: string) {
    try {
      const transcriptItems = await YoutubeTranscript.fetchTranscript(
        videoUrl,
        {
          lang: 'ru',
        },
      );

      if (!transcriptItems || transcriptItems.length === 0) {
        throw new Error('Транскрипт пуст или не найден');
      }

      // 1. Сохраняем чанки в БД (используем транзакцию для надежности)
      await prisma.transcriptChunk.createMany({
        data: transcriptItems.map((item) => ({
          videoId: videoId,
          startTime: item.offset / 1000, // Конвертируем мс в сек
          endTime: (item.offset + item.duration) / 1000,
          text: item.text,
        })),
      });

      // 2. Формируем строку для AI: [0s] текст [15s] текст...
      const fullTextWithTimestamps = transcriptItems
        .map((item) => `[${Math.floor(item.offset / 1000)}s] ${item.text}`)
        .join(' ');

      return fullTextWithTimestamps;
    } catch (error) {
      console.error(`[YoutubeService] Error for ${videoId}:`, error);
      throw error;
    }
  }
}
