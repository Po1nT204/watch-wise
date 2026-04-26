import { logger } from '@/config/logger';
import { APP_CONFIG } from '@/constants/app';
import axios from 'axios';
import pRetry from 'p-retry';

interface SpeechKitV3Chunk {
  result?: {
    final?: {
      alternatives?: Array<{
        text: string;
        words?: Array<{
          startTimeMs: string;
          endTimeMs: string;
        }>;
      }>;
    };
    finalRefinement?: {
      normalizedText?: {
        alternatives?: Array<{
          text: string;
          words?: Array<{
            startTimeMs: string;
            endTimeMs: string;
          }>;
        }>;
      };
    };
  };
}

export interface SpeechKitResponse {
  done: boolean;
  id: string;
  createdAt: string;
  createdBy: string;
  modifiedAt: string;
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

  private static async fetchWithRetry<T>(
    requestFn: (signal: AbortSignal) => Promise<T>,
  ): Promise<T> {
    return pRetry(
      async () => {
        const signal = AbortSignal.timeout(
          APP_CONFIG.API.SPEECHKIT_FETCH_TIMEOUT,
        );
        return await requestFn(signal);
      },
      {
        retries: 3,
        minTimeout: 1000,
        factor: 2,
        onFailedAttempt: (error) => {
          logger.warn(
            {
              attemptNumber: error.attemptNumber,
              retriesLeft: error.retriesLeft,
            },
            'SpeechKit API call failed, retrying...',
          );
        },
      },
    );
  }

  static async createTask(fileUri: string): Promise<string> {
    const apiKey = this.getApiKey();
    const folderId = this.getFolderId();

    try {
      logger.info({ fileUri }, 'Starting CREATE TASK to S3 yandex cloud');

      const response = await this.fetchWithRetry((signal) =>
        axios.post(
          'https://stt.api.cloud.yandex.net/stt/v3/recognizeFileAsync',
          {
            uri: fileUri,
            recognition_model: {
              model: 'general',
              audio_format: {
                container_audio: { container_audio_type: 'MP3' },
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
            signal,
          },
        ),
      );

      logger.info(
        { fileUri, taskId: response.data.id },
        'CREATE TASK completed',
      );
      return response.data.id;
    } catch (error) {
      logger.error(
        { err: error },
        'CREATE TASK to S3 yandex cloud failed fatally',
      );
      throw error;
    }
  }

  static async getTaskStatus(taskId: string): Promise<SpeechKitResponse> {
    const apiKey = this.getApiKey();

    const response = await axios.get(
      `https://operation.api.cloud.yandex.net/operations/${taskId}`,
      {
        headers: {
          Authorization: `Api-Key ${apiKey}`,
          'x-folder-id': this.getFolderId(),
        },
        signal: AbortSignal.timeout(APP_CONFIG.API.SPEECHKIT_POLLING_INTERVAL),
      },
    );

    return response.data;
  }

  static async getRecognitionResult(taskId: string) {
    const apiKey = this.getApiKey();

    const response = await this.fetchWithRetry((signal) =>
      axios.get(
        `https://stt.api.cloud.yandex.net/stt/v3/getRecognition?operation_id=${taskId}`,
        {
          headers: { Authorization: `Api-Key ${apiKey}` },
          signal,
        },
      ),
    );

    return response.data;
  }

  static parseV3Response(rawResponse: unknown) {
    const chunks: { startTime: number; endTime: number; text: string }[] = [];
    let results: SpeechKitV3Chunk[] = [];

    try {
      logger.info('Starting PARSE AUDIO from speechkit');

      if (typeof rawResponse === 'string') {
        const normalizedResponse = rawResponse.replace(/\}\s*\{/g, '}|||{');
        const jsonStrings = normalizedResponse.split('|||');
        results = jsonStrings.map((str) => JSON.parse(str));
      } else if (Array.isArray(rawResponse)) {
        results = rawResponse as SpeechKitV3Chunk[];
      } else {
        results = [rawResponse as SpeechKitV3Chunk];
      }

      results.forEach((item) => {
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

      logger.info('PARSE AUDIO from speechkit completed');
    } catch (error) {
      logger.error({ err: error }, 'PARSE AUDIO from speechkit failed');
    }

    return chunks;
  }
}
