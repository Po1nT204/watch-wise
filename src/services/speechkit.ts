import { logger } from '@/config/logger';
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
      logger.info({ fileUri }, 'Starting CREATE TASK to S3 yandex cloud');
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

      logger.info(
        { fileUri, taskId: response.data.id },
        'CREATE TASK to S3 yandex cloud completed',
      );
      return response.data.id;
    } catch (error) {
      logger.error({ err: error }, 'CREATE TASK to S3 yandex cloud failed');
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

  static parseV3Response(rawResponse: any) {
    const chunks: { startTime: number; endTime: number; text: string }[] = [];

    let results: any[] = [];

    try {
      logger.info(
        { responseLength: rawResponse.length },
        'Starting PARSE AUDIO from speechkit',
      );
      if (typeof rawResponse === 'string') {
        const normalizedResponse = rawResponse.replace(/\}\s*\{/g, '}|||{');
        const jsonStrings = normalizedResponse.split('|||');

        results = jsonStrings.map((str) => JSON.parse(str));
      } else {
        results = Array.isArray(rawResponse) ? rawResponse : [rawResponse];
      }

      results.forEach((item: any) => {
        // В API v3 текст может быть в разных блоках, проверяем все варианты
        const finalResult =
          item.result?.final || item.result?.finalRefinement?.normalizedText;

        if (
          finalResult &&
          finalResult.alternatives &&
          finalResult.alternatives[0]
        ) {
          const alt = finalResult.alternatives[0];

          if (alt.words && alt.words.length > 0) {
            const startMs = parseInt(alt.words[0].startTimeMs);
            const endMs = parseInt(alt.words[alt.words.length - 1].endTimeMs);

            chunks.push({
              startTime: startMs / 1000,
              endTime: endMs / 1000,
              text: alt.text,
            });
          }
        }
      });

      logger.info(
        {
          responseLength: rawResponse.length,
          finalResultLength: results.length,
        },
        'PARSE AUDIO from speechkit completed',
      );
    } catch (error) {
      logger.error(
        { err: error, responseLength: rawResponse.length },
        'PARSE AUDIO from speechkit failed',
      );
      if (typeof rawResponse === 'string') {
        logger.error(
          {
            err: error,
            responseLength: rawResponse.length,
            responseFragment: rawResponse.substring(0, 100),
          },
          'PARSE AUDIO from speechkit failed and was string',
        );
      }
    }

    return chunks;
  }
}
