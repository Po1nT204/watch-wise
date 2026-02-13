export interface YandexGPTRequest {
  messages: { role: string; text: string }[];
  instruction: string;
}

export interface STTResponse {
  chunks: { start: string; end: string; text: string }[];
}

export class YandexCloudService {
  private static folderId = process.env.YANDEX_FOLDER_ID;
  private static apiKey = process.env.YANDEX_API_KEY;

  // Заглушка для SpeechKit (Audio to Text)
  static async transcribeAudio(audioUrl: string): Promise<STTResponse> {
    console.log('STT request for:', audioUrl);
    // Логика будет тут
    return { chunks: [] };
  }

  // Заглушка для YandexGPT
  static async generateLearningContent(transcript: string, prompt: string) {
    console.log('GPT request with transcript length:', transcript.length);
    // Логика будет тут
    return null;
  }
}
