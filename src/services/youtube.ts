import { YoutubeTranscript } from 'youtube-transcript';

export async function getYouTubeTranscript(videoUrl: string) {
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoUrl, {
      lang: 'ru', // Можно сделать динамическим позже
    });

    // Возвращаем склеенный текст для AI
    return transcript.map((item) => item.text).join(' ');
  } catch (error) {
    console.error('YouTube Transcript Error:', error);
    // Если на русском нет, пробуем на английском или возвращаем null
    return null;
  }
}
