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

  private static getFolderId() {
    const id = process.env.YANDEX_FOLDER_ID;
    if (!id) throw new Error('YANDEX_FOLDER_ID не найден в .env');
    return id;
  }

  /**
   * Отправляет файл из S3 на асинхронное распознавание
   */
  static async createTask(fileUri: string): Promise<string> {
    const apiKey = this.getApiKey();
    const folderId = this.getFolderId();

    try {
      const response = await axios.post(
        'https://stt.api.cloud.yandex.net/stt/v3/recognizeFileAsync',
        {
          uri: fileUri,
          recognition_model: {
            model: 'general',
            audio_format: {
              container_audio: {
                container_audio_type: 'MP3',
              },
            },
            text_normalization: {
              text_normalization: 'TEXT_NORMALIZATION_ENABLED',
              profanity_filter: false,
            },
          },
        },
        {
          headers: {
            Authorization: `Api-Key ${apiKey}`,
            'x-folder-id': folderId,
          },
        },
      );

      return response.data.id;
    } catch (error: any) {
      console.error(
        '[SpeechKit] createTask error details:',
        error.response?.data || error.message,
      );
      throw error;
    }
  }

  /**
   * Проверяет статус операции
   */
  static async getTaskStatus(taskId: string): Promise<SpeechKitResponse> {
    const apiKey = this.getApiKey();
    const response = await axios.get(
      `https://operation.api.cloud.yandex.net/operations/${taskId}`,
      {
        headers: {
          Authorization: `Api-Key ${apiKey}`,
          'x-folder-id': this.getFolderId(),
        },
      },
    );

    return response.data;
  }

  /**
   * Получение самого текста (для API v3 это отдельный шаг после того как done: true)
   */
  static async getRecognitionResult(taskId: string) {
    const apiKey = this.getApiKey();
    const response = await axios.get(
      `https://stt.api.cloud.yandex.net/stt/v3/getRecognition?operation_id=${taskId}`,
      {
        headers: {
          Authorization: `Api-Key ${apiKey}`,
        },
      },
    );
    return response.data;
  }
}
