import { VideoDownloader } from './src/services/video-downloader';
import { S3Service } from './src/services/s3';
import dotenv from 'dotenv';

dotenv.config();

async function testFullFlow() {
  const url = 'https://vkvideo.ru/video-201754717_456239025';
  const videoId = 'vk_test_' + Date.now();

  try {
    console.log('--- Шаг 1: Скачивание аудио дорожки ---');
    const localPath = await VideoDownloader.extractAudio(url, videoId);
    console.log('Файл готов локально:', localPath);

    console.log('--- Шаг 2: Загрузка в Yandex S3 ---');
    const cloudUrl = await S3Service.uploadAudio(localPath, videoId);
    console.log('Успех! Ссылка для SpeechKit:', cloudUrl);
  } catch (error) {
    console.error('Ошибка в тесте:', error);
  }
}

testFullFlow();
