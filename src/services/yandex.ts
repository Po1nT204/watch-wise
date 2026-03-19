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
    const systemPrompt = `Ты — эксперт-методист и редактор. Твоя задача: проанализировать сырой транскрипт видео и создать качественный обучающий контент.
    
    ИНСТРУКЦИИ:
    1. SUMMARY: Сделай связный, грамотный текст (3-5 абзацев). Убери ошибки-галюцинации транскрипта, слова-паразиты, повторы и приветствия. Сфокусируйся на сути.
    2. QUESTIONS: Сгенерируй ровно ${settings.count} вопросов. Вопросы должны проверять понимание темы видео, а не просто знание фактов.
    3. JSON: Ответ должен быть строго в формате JSON без лишнего текста.

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
          { role: 'user', content: `Транскрипт для обработки: ${transcript}` },
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
