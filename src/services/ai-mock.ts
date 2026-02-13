import prisma from '@/config/prisma';

interface AnalysisSettings {
  mode: string;
  difficulty: string;
  questionsCount: number;
}

export async function simulateVideoAnalysis(
  videoId: string,
  userId: string,
  settings: AnalysisSettings,
) {
  // 1. Ставим статус "В обработке"
  await prisma.video.update({
    where: { id: videoId },
    data: { status: 'PROCESSING' },
  });

  // Имитируем задержку
  await new Promise((resolve) => setTimeout(resolve, 2000));

  try {
    // 2. Создаем транскрипт (если его еще нет)
    // Проверяем, есть ли уже чанки, чтобы не дублировать при повторном анализе
    const existingChunks = await prisma.transcriptChunk.count({
      where: { videoId },
    });

    if (existingChunks === 0) {
      const transcriptData = [
        {
          startTime: 0,
          endTime: 10,
          text: 'Привет! Сегодня мы разберем основы проектирования высоконагруженных систем.',
        },
        {
          startTime: 10,
          endTime: 25,
          text: 'Первое, с чего стоит начать — это понимание требований: функциональных и нефункциональных.',
        },
        {
          startTime: 25,
          endTime: 45,
          text: 'Нефункциональные требования включают в себя масштабируемость, доступность и надежность.',
        },
      ];

      await prisma.transcriptChunk.createMany({
        data: transcriptData.map((chunk) => ({ ...chunk, videoId })),
      });
    }

    // 3. Генерируем вопросы в зависимости от settings.questionsCount
    const mockQuestions = Array.from({ length: settings.questionsCount }).map(
      (_, i) => ({
        text: `Вопрос #${i + 1} (${settings.difficulty}) для режима ${settings.mode}: Какая характеристика системы отвечает за работу при росте нагрузки?`,
        timestamp: (i + 1) * 15.0,
        correctIdx: 0,
        options: [
          'Масштабируемость',
          'Инкапсуляция',
          'Полиморфизм',
          'Цветокоррекция',
        ],
        explanation: `Это тестовый ответ для уровня ${settings.difficulty}.`,
      }),
    );

    // 4. Создаем сгенерированный контент
    await prisma.generatedContent.create({
      data: {
        videoId,
        userId,
        difficulty: settings.difficulty,
        mode: settings.mode,
        summary: `Это краткое резюме, адаптированное под режим "${settings.mode}" и уровень сложности "${settings.difficulty}". В видео обсуждаются основы System Design.`,
        questions: {
          create: mockQuestions,
        },
      },
    });

    // 5. Завершаем анализ
    await prisma.video.update({
      where: { id: videoId },
      data: { status: 'COMPLETED' },
    });

    return { success: true };
  } catch (error) {
    console.error('Mock Analysis Error:', error);
    await prisma.video.update({
      where: { id: videoId },
      data: { status: 'FAILED' },
    });
    throw error;
  }
}
