import OpenAI from 'openai';
import { AIGeneratedContentSchema } from '@/shared/schemas';
import { logger } from '@/config/logger';
import pRetry from 'p-retry';

export class YandexCloudService {
  private static apiKey = process.env.YANDEX_API_KEY;
  private static folderId = process.env.YANDEX_FOLDER_ID;

  private static openai = new OpenAI({
    apiKey: this.apiKey,
    baseURL: 'https://ai.api.cloud.yandex.net/v1',
    project: this.folderId,
  });

  static async generateLearningContent(
    transcript: string,
    settings: { difficulty: string; count: number },
  ) {
    const systemPrompt = `Ты — ведущий методист образовательных платформ. Твоя задача: превратить сырой транскрипт видео с метками времени [Xs] в структурированный конспект и интерактивный тест.

ИНСТРУКЦИИ:
1. SUMMARY: 
    - Напиши четкий образовательный конспект в формате Markdown. Используй заголовки (##), жирный текст для терминов и маркированные списки. Убери "мусор", мелкие ошибки транскрипта, приветствия и повторы.
    - Вставляй в конспект кликабельные ключевые метки времени в формате [...s] (например [164s]) в конце каждого ключевого тезиса или раздела (например, [54s]), основываясь на данных из транскрипта. Оставляй таймкоды в исходном виде [...s], не пытайся переводить их в минуты.
2. QUESTIONS: Сгенерируй ровно ${settings.count} вопросов. 
   - Сложность "${settings.difficulty}": 
     * 'easy' — вопросы на знание конкретных фактов, четко произнесенных в видео;
     * 'medium' — вопросы на понимание логики и причин;
     * 'hard' — вопросы на анализ и выводы из сказанного.
   - ЛОГИКА ТАЙМКОДОВ (КРИТИЧНО): Вопрос должен появляться ТОЛЬКО ПОСЛЕ того, как информация была полностью озвучена. 
     Пример: если информация для вопроса содержится в блоке "[10s] Текст ответа... [25s]", ты обязан поставить "timestamp": 25. 
     Ты должен найти метку времени, которая идет СРАЗУ ПОСЛЕ предложения, содержащего ответ. Видео должно остановиться на паузу в момент логического завершения мысли, а не в её начале.
     Запрещена метка времени
    - ЗАПРЕТ: "timestamp" вопроса не может быть больше, чем последняя временная метка в предоставленном транскрипте. Не ставь вопросы на самую последнюю секунду видео, чтобы пользователь успел ответить до завершения ролика.
3. FLASHCARDS: Выдели 3-5 ключевых терминов или концепций из видео и сделай из них карточки (термин + определение).
4. TAGS: Сгенерируй от 1 до 3 коротких тегов (категорий), к которым относится это видео (например: "Программирование", "История", "React", "ОБЖ", "Обществознание", "Математика").
5. JSON: Ответ должен содержать ТОЛЬКО объект JSON.

СТРУКТУРА JSON:
{
  "summary": "текст конспекта",
  "questions": [
    {
      "text": "Текст вопроса",
      "timestamp": число_из_текста,
      "options": ["вариант1", "вариант2", "вариант3", "вариант4"],
      "correctIdx": индекс_верного,
      "explanation": "Одна пояснительная фраза, почему этот ответ верный."
    }
  ],
  "flashcards": [
    { "term": "Понятие", "definition": "Краткое определение" }
  ],
  "tags": ["Тег1", "Тег2"]
}`;

    // Обертка для выполнения запроса с возможностью повтора
    const runInference = async () => {
      logger.info(
        { settings, transcriptLength: transcript.length },
        'Requesting YandexGPT for learning content',
      );

      // Таймаут на уровне запроса: 45 секунд (Node.js 16.14+)
      const signal = AbortSignal.timeout(45000);

      const response = await this.openai.chat.completions.create(
        {
          model: `gpt://${this.folderId}/yandexgpt/latest`,
          messages: [
            { role: 'system', content: systemPrompt },
            {
              role: 'user',
              content: `Вот транскрипт с таймкодами: ${transcript}. 
    Сложность: ${settings.difficulty}. 
    Количество вопросов: ${settings.count}. 
    Расставь вопросы равномерно по видео, используя реальные метки времени из текста, избегая начальный и конечный края видео.`,
            },
          ],
          temperature: 0.3,
        },
        { signal }, // Передаем сигнал таймаута
      );

      const content = response.choices[0].message.content || '';
      logger.debug(
        { responseContent: content.substring(0, 100) },
        'Received response from YandexGPT',
      );

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        logger.error({ content }, 'YandexGPT returned non-JSON format');
        // Выбрасываем ошибку, чтобы p-retry попытался снова!
        throw new Error(
          'Ответ нейросети не содержит структурированных данных (JSON)',
        );
      }

      const cleanJson = jsonMatch[0];
      const parsedJson = JSON.parse(cleanJson);
      const validatedData = AIGeneratedContentSchema.parse(parsedJson);

      logger.info('Learning content successfully generated and validated');
      return validatedData;
    };

    try {
      // Исполняем с паттерном Exponential Backoff (до 3 попыток)
      return await pRetry(runInference, {
        retries: 2, // 1 первоначальная + 2 повторных = 3 попытки
        minTimeout: 2000, // Минимальная задержка 2 сек
        maxTimeout: 10000, // Максимальная задержка 10 сек
        onFailedAttempt: (error) => {
          logger.warn(
            {
              attemptNumber: error.attemptNumber,
              retriesLeft: error.retriesLeft,
              message: error instanceof Error ? error.message : String(error),
            },
            'YandexGPT request failed, retrying...',
          );
        },
      });
    } catch (error) {
      logger.error({ err: error }, 'Yandex AI Studio Error after all retries');
      throw new Error(
        'Не удалось получить обучающий контент от YandexGPT после нескольких попыток',
      );
    }
  }
}
