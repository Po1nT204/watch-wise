import prisma from '@/config/prisma';

export async function getUserDashboardStats(userId: string) {
  // Агрегация по результатам тестов
  const testResults = await prisma.testResult.aggregate({
    where: { userId },
    _count: { id: true },
    _sum: { score: true, total: true },
  });

  // Подсчет количества флеш-карточек пользователя
  const flashcardsCount = await prisma.flashcard.count({
    where: {
      content: {
        userId: userId,
      },
    },
  });

  const totalTests = testResults._count.id;
  const totalScore = testResults._sum.score || 0;
  const totalQuestions = testResults._sum.total || 0;

  // Защита от деления на ноль
  const accuracy =
    totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;

  return {
    totalTests,
    accuracy,
    totalQuestions,
    flashcardsCount,
  };
}
