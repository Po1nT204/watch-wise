import { YtDlp } from 'ytdlp-nodejs';
import path from 'path';
import fs from 'fs';

export class VideoDownloader {
  private static ytdlp = new YtDlp();

  static async extractAudio(url: string, videoId: string): Promise<string> {
    // Создаем временную папку, если её нет
    const tempDir = path.join(process.cwd(), 'temp-audio');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    const outputPath = path.join(tempDir, `${videoId}.mp3`);

    try {
      console.log(`[Downloader] Starting extraction for: ${url}`);

      await this.ytdlp
        .download(url)
        .extractAudio()
        .audioFormat('mp3')
        .output(tempDir)
        // Настраиваем имя выходного файла через шаблон yt-dlp
        .setOutputTemplate(path.join(tempDir, `${videoId}.%(ext)s`))
        .run();

      return outputPath;
    } catch (error) {
      console.error('[Downloader] Extraction failed:', error);
      throw new Error('Не удалось извлечь аудио из видео');
    }
  }
}
