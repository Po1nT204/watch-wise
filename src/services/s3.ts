import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';

export class S3Service {
  private static getClient() {
    return new S3Client({
      region: 'ru-central1',
      endpoint: 'https://storage.yandexcloud.net',
      credentials: {
        accessKeyId: process.env.YANDEX_STORAGE_ACCESS_KEY || '',
        secretAccessKey: process.env.YANDEX_STORAGE_SECRET_KEY || '',
      },
    });
  }

  static async uploadAudio(filePath: string, videoId: string): Promise<string> {
    const bucketName = process.env.YANDEX_STORAGE_BUCKET_NAME;

    if (!bucketName) {
      throw new Error('YANDEX_STORAGE_BUCKET_NAME не определен в .env');
    }

    const fileContent = fs.readFileSync(filePath);
    const key = `audio/${videoId}.mp3`;
    const client = this.getClient(); // Создаем клиент здесь

    try {
      await client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: key,
          Body: fileContent,
          ContentType: 'audio/mpeg',
        }),
      );

      return `https://storage.yandexcloud.net/${bucketName}/${key}`;
    } catch (error) {
      console.error('[S3Service] Upload failed:', error);
      throw new Error('Ошибка при загрузке аудио в облако');
    }
  }
}
