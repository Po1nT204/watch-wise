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
    // 3. Расширенный транскрипт для проверки скролла и навигации
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
        endTime: 40,
        text: 'Нефункциональные требования включают в себя масштабируемость, доступность и надежность.',
      },
      {
        startTime: 40,
        endTime: 55,
        text: 'Далее мы перейдем к концепции Single Point of Failure. Это критический узел системы, отказ которого ведет к остановке всего сервиса.',
      },
      {
        startTime: 55,
        endTime: 75,
        text: 'Для борьбы с этим используется репликация и шардирование данных. Репликация позволяет хранить копии базы данных на разных серверах.',
      },
      {
        startTime: 75,
        endTime: 95,
        text: 'Шардирование же — это процесс разделения большой таблицы на части для распределения нагрузки между узлами.',
      },
      {
        startTime: 95,
        endTime: 110,
        text: 'Также важную роль играет балансировщик нагрузки (Load Balancer), который распределяет запросы пользователей.',
      },
      {
        startTime: 110,
        endTime: 125,
        text: 'В завершение обсудим кэширование. Это способ ускорить чтение данных за счет использования оперативной памяти.',
      },
    ];

    await prisma.transcriptChunk.createMany({
      data: transcriptData.map((chunk) => ({
        ...chunk,
        videoId,
      })),
    });

    // 4. Расширенный контент с несколькими вопросами
    await prisma.generatedContent.create({
      data: {
        videoId,
        userId,
        difficulty: 'medium',
        mode: 'student',
        summary:
          'В данном материале рассматриваются фундаментальные аспекты System Design: классификация требований (NFR/FR), методы обеспечения отказоустойчивости через устранение SPOF, а также базовые техники масштабирования — репликация, шардирование и кэширование.',
        questions: {
          create: [
            {
              text: 'Что такое Single Point of Failure (SPOF)?',
              timestamp: 42.0,
              correctIdx: 2,
              options: [
                'Метод ускорения базы данных',
                'Алгоритм шифрования',
                'Критический узел, отказ которого ломает всю систему',
                'Тип сетевого протокола',
              ],
              explanation:
                'SPOF — это компонент системы, который не имеет дубликата и при выходе из строя делает систему неработоспособной.',
            },
            {
              text: 'В чем ключевое отличие шардирования от репликации?',
              timestamp: 80.0,
              correctIdx: 0,
              options: [
                'Шардирование делит данные на части, репликация — копирует их',
                'Это синонимы',
                'Репликация используется только для кэша',
                'Шардирование замедляет систему',
              ],
              explanation:
                'Репликация — это копирование (HA), шардирование — это горизонтальное масштабирование через деление данных.',
            },
            {
              text: 'Какую задачу выполняет Load Balancer?',
              timestamp: 100.0,
              correctIdx: 1,
              options: [
                'Хранение паролей',
                'Распределение входящего трафика между серверами',
                'Очистка кэша',
                'Транскрибация видео',
              ],
              explanation:
                'Балансировщик распределяет запросы, чтобы ни один сервер не был перегружен.',
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
    console.error('Mock Analysis Error:', error);
    await prisma.video.update({
      where: { id: videoId },
      data: { status: 'FAILED' },
    });
    throw error;
  }
}
