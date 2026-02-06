import prisma from '@/config/prisma';

export async function simulateVideoAnalysis(videoId: string, userId: string) {
  // 1. Ставим статус "В обработке"
  await prisma.video.update({
    where: { id: videoId },
    data: { status: 'PROCESSING' },
  });

  // 2. Имитируем задержку (3 секунды)
  await new Promise((resolve) => setTimeout(resolve, 3000));

  try {
    // 3. Создаем транскрипт (кусочки)
    const transcriptData = [
      {
        startTime: 0,
        endTime: 10.5,
        text: 'Привет! Сегодня мы разберем основы проектирования высоконагруженных систем.',
      },
      {
        startTime: 10.5,
        endTime: 25.0,
        text: 'Первое, с чего стоит начать — это понимание требований: функциональных и нефункциональных.',
      },
      {
        startTime: 25.0,
        endTime: 45.2,
        text: 'Нефункциональные требования включают в себя масштабируемость, доступность и надежность.',
      },
    ];

    await prisma.transcriptChunk.createMany({
      data: transcriptData.map((chunk) => ({
        ...chunk,
        videoId,
      })),
    });

    // 4. Создаем сгенерированный контент (саммари и вопросы)
    const content = await prisma.generatedContent.create({
      data: {
        videoId,
        userId,
        difficulty: 'medium',
        mode: 'student',
        summary:
          'В видео рассматриваются базовые концепции System Design, включая разделение требований на функциональные и нефункциональные (масштабируемость, доступность).',
        questions: {
          create: [
            {
              text: 'Какие требования включают в себя масштабируемость и надежность?',
              timestamp: 25.5,
              correctIdx: 1,
              options: [
                'Функциональные',
                'Нефункциональные',
                'Бизнес-требования',
                'Технические задания',
              ],
              explanation:
                'Масштабируемость и надежность — это классические атрибуты качества системы (NFR).',
            },
          ],
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
    await prisma.video.update({
      where: { id: videoId },
      data: { status: 'FAILED' },
    });
    throw error;
  }
}
