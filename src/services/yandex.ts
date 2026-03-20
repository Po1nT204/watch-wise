import OpenAI from 'openai';

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
    const systemPrompt = `Ты — эксперт-методист и редактор. Твоя задача: проанализировать сырой транскрипт видео с метками времени [Xs] и создать качественный обучающий контент.
    
    ИНСТРУКЦИИ:
    1. SUMMARY: Сделай связный, грамотный текст (3-5 абзацев). Убери ошибки-галюцинации транскрипта, слова-паразиты, повторы и приветствия. Сфокусируйся на сути.
    2. QUESTIONS: Сгенерируй ровно ${settings.count} вопросов. Вопросы должны проверять понимание темы видео, а не просто знание фактов.
      ВАЖНО: Поле "timestamp" должно СТРОГО соответствовать секундам из меток времени [Xs] в тексте. Выбирай метку времени, которая идет ПЕРЕД началом обсуждения вопроса. 
      Не должно случиться такого, что вопрос задается в рандомный момент времени или когда информация из видео еще не сказана.
    3. JSON: Ответ должен быть строго в формате JSON без лишнего текста.
    4. TIMESTAMPS: Вопрос должен появляться ПОСЛЕ того, как информация была озвучена а мысль закончена. Вычисли время конца фразы и конца темы. Например, если тема вопроса обсуждается в блоке [30s]-[45s], ставь timestamp: 65-80 (давай задержку в 20-35 секунд ПОСЛЕ ЗАВЕРШЕНИЯ МЫСЛИ).

    СТРУКТУРА JSON:
    {
      "summary": "Текст саммари в формате Markdown (используй заголовки, списки)",
      "questions": [
        { 
          "text": "Текст вопроса", 
          "timestamp": число_секунд_начала_темы, 
          "options": ["А", "Б", "В", "Г"], 
          "correctIdx": индекс_правильного, 
          "explanation": "Почему этот ответ верный?" 
        }
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
    Расставь вопросы равномерно по видео, используя реальные метки времени из текста.`,
          },
        ],
        temperature: 0.3,
      });

      const content = response.choices[0].message.content || '';
      console.log(content);
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('ИИ прислал не JSON:', content);
        throw new Error('Ответ нейросети не содержит структурированных данных');
      }

      const cleanJson = jsonMatch[0];
      return JSON.parse(cleanJson);
    } catch (error) {
      console.error('Yandex AI Studio Error:', error);
      throw error;
    }
  }
}
