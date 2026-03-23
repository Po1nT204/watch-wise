import { YtDlp } from 'ytdlp-nodejs';
import path from 'path';
import fs from 'fs';

async function test() {
  const ytdlp = new YtDlp();
  const url = 'https://vkvideo.ru/video-168455415_456254013';
  const videoId = 'test_vk_video';

  const tempDir = path.join(process.cwd(), 'temp-audio');
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

  console.log('--- Начинаем загрузку аудио ---');

  try {
    await ytdlp
      .download(url)
      .extractAudio()
      .audioFormat('mp3')
      .output(tempDir)
      .setOutputTemplate(`${videoId}.%(ext)s`)
      .run();

    console.log('--- Успех! Проверь папку temp-audio ---');
  } catch (e) {
    console.error('--- Ошибка ---', e);
  }
}

test();
