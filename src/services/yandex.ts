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
    const systemPrompt = `Ты — профессиональный методист. Проанализируй текст и создай JSON:
    {
      "summary": "краткое содержание",
      "questions": [
        { "text": "вопрос", "timestamp": 10, "options": ["а", "б", "в", "г"], "correctIdx": 0, "explanation": "почему" }
      ]
    }. Отвечай ТОЛЬКО чистым JSON.`;

    try {
      const response = await this.openai.chat.completions.create({
        // Путь к модели в AI Studio
        model: `gpt://${this.folderId}/yandexgpt/latest`,
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `Текст: ${transcript}. Сложность: ${settings.difficulty}. Вопросов: ${settings.count}`,
          },
        ],
        temperature: 0.3,
      });

      const content = response.choices[0].message.content || '';
      const cleanJson = content.replace(/```json|```/g, '').trim();

      return JSON.parse(cleanJson);
    } catch (error) {
      console.error('Yandex AI Studio Error:', error);
      throw error;
    }
  }
}
