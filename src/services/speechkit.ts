import axios from 'axios';

export interface SpeechKitResponse {
  done: boolean;
  id: string;
  createdAt: string;
  createdBy: string;
  modifiedAt: string;
  response?: {
    '@type': string;
    chunks: Array<{
      alternatives: Array<{
        words: Array<{
          startTime: string;
          endTime: string;
          text: string;
          confidence: number;
        }>;
        text: string;
        confidence: number;
      }>;
      channelTag: string;
    }>;
  };
  error?: {
    code: number;
    message: string;
  };
}

export class SpeechKitService {
  private static getApiKey() {
    const key = process.env.YANDEX_API_KEY;
    if (!key) throw new Error('YANDEX_API_KEY не найден в .env');
    return key;
  }

  /**
   * Отправляет файл из S3 на асинхронное распознавание
   */
  static async createTask(fileUri: string): Promise<string> {
    const apiKey = this.getApiKey();

    const response = await axios.post(
      'https://transcribe.api.cloud.yandex.net/speech/stt/v2/longRunningRecognize',
      {
        config: {
          specification: {
            languageCode: 'ru-RU',
            model: 'general',
            audioEncoding: 'MP3',
            hasTimestamps: true,
          },
        },
        audio: {
          uri: fileUri,
        },
      },
      {
        headers: { Authorization: `Api-Key ${apiKey}` },
      },
    );

    return response.data.id;
  }

  /**
   * Проверяет статус операции
   */
  static async getTaskStatus(taskId: string): Promise<SpeechKitResponse> {
    const apiKey = this.getApiKey();
    const response = await axios.get(
      `https://operation.api.cloud.yandex.net/operations/${taskId}`,
      {
        headers: { Authorization: `Api-Key ${apiKey}` },
      },
    );

    return response.data;
  }
}
