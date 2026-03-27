import OpenAI from 'openai';
import { AIGeneratedContentSchema } from '@/shared/schemas';

export class YandexCloudService {
  private static apiKey = process.env.YANDEX_API_KEY;
  private static folderId = process.env.YANDEX_FOLDER_ID;

  private static openai = new OpenAI({
    apiKey: this.apiKey,
    baseURL: 'https://ai.api.cloud.yandex.net/v1',
    // В Yandex AI Studio FOLDER_ID передается как 'project'
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
    - Вставляй в конспект кликабельные метки времени в формате [MM:SS] в конце каждого ключевого тезиса или раздела (например, [05:20]), основываясь на данных из транскрипта.
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
4. JSON: Ответ должен содержать ТОЛЬКО объект JSON.

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
  ]
}`;

    try {
      const response = await this.openai.chat.completions.create({
        // Путь к модели в AI Studio
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
      });

      const content = response.choices[0].message.content || '';
      console.log('AI Response:', content);

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('ИИ прислал не JSON:', content);
        throw new Error('Ответ нейросети не содержит структурированных данных');
      }

      const cleanJson = jsonMatch[0];
      const parsedJson = JSON.parse(cleanJson);
      const validatedData = AIGeneratedContentSchema.parse(parsedJson);

      return validatedData;
    } catch (error) {
      console.error('Yandex AI Studio Error:', error);
      throw error;
    }
  }
}
