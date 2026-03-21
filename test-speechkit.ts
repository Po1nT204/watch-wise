import { VideoDownloader } from './src/services/video-downloader';
import { S3Service } from './src/services/s3';
import { SpeechKitService } from './src/services/speechkit';
import dotenv from 'dotenv';

dotenv.config();

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function testASRPipeline() {
  const url = 'https://vkvideo.ru/video-168455415_456254013';
  const videoId = 'vk_asr_test_' + Date.now();

  try {
    console.log('--- 1. Извлечение аудио ---');
    const localPath = await VideoDownloader.extractAudio(url, videoId);

    console.log('--- 2. Загрузка в бакет ---');
    const s3Url = await S3Service.uploadAudio(localPath, videoId);
    console.log('Файл в облаке:', s3Url);

    console.log('--- 3. Отправка в SpeechKit ---');
    const taskId = await SpeechKitService.createTask(s3Url);
    console.log('ID задачи распознавания:', taskId);

    console.log('--- 4. Ожидание результата (Polling) ---');
    let isDone = false;
    let attempts = 0;

    while (!isDone && attempts < 60) {
      // Ждем максимум 5 минут (60 * 5 сек)
      attempts++;
      const result = await SpeechKitService.getTaskStatus(taskId);

      if (result.done) {
        isDone = true;
        console.log('--- УСПЕХ! Текст получен ---');

        // Выводим первые 300 символов распознанного текста
        const fullText = result.response?.chunks
          .map((chunk) => chunk.alternatives[0].text)
          .join(' ');

        console.log(
          'Результат (фрагмент):',
          fullText?.substring(0, 500) + '...',
        );

        // Для отладки таймкодов выведем первое слово
        const firstWord = result.response?.chunks[0].alternatives[0].words[0];
        console.log('Пример таймкода первого слова:', firstWord);
        break;
      } else {
        console.log(`[${attempts}] Еще распознается... ждем 5 сек`);
        await sleep(5000);
      }
    }

    if (!isDone) console.error('Ошибка: Превышено время ожидания');
  } catch (error: any) {
    console.error('Критическая ошибка в пайплайне:');
    if (error.response) {
      console.error('Данные ошибки от Яндекса:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

testASRPipeline();
