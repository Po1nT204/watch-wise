import { YtDlp } from 'ytdlp-nodejs';
import path from 'path';
import fs from 'fs';
import { logger } from '@/config/logger';

export class VideoDownloader {
  private static ytdlp = new YtDlp();

  static async extractAudio(url: string, videoId: string): Promise<string> {
    const tempDir = path.join(process.cwd(), 'temp-audio');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    const outputPath = path.join(tempDir, `${videoId}.mp3`);

    try {
      logger.info({ videoId, url }, 'Starting AUDIO extraction');

      await this.ytdlp
        .download(url)
        .extractAudio()
        .audioFormat('mp3')
        .output(tempDir)
        .setOutputTemplate(path.join(tempDir, `${videoId}.%(ext)s`))
        .run();

      logger.info({ videoId, outputPath }, 'AUDIO extraction completed');
      return outputPath;
    } catch (error) {
      logger.error({ err: error, videoId, url }, 'Audio Extraction failed');
      throw new Error('Не удалось извлечь аудио из видео');
    }
  }

  static async extractVideo(
    url: string,
    videoId: string,
    height: number = 480,
  ): Promise<string> {
    const tempDir = path.join(process.cwd(), 'temp-video');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    const outputPath = path.join(tempDir, `${videoId}.mp4`);

    try {
      logger.info({ videoId, url, height }, 'Starting VIDEO extraction');

      await new YtDlp()
        .download(url)
        .format(`best[height<=${height}][ext=mp4]/best[height<=${height}]`)
        .output(tempDir)
        .setOutputTemplate(path.join(tempDir, `${videoId}.mp4`))
        .run();

      logger.info({ videoId, outputPath }, 'VIDEO extraction completed');
      return outputPath;
    } catch (error) {
      logger.error(
        { err: error, videoId, url, height },
        'Video Extraction failed',
      );
      throw new Error('Не удалось скачать видео');
    }
  }
}
