import prisma from '@/config/prisma';

export async function getUserDashboardStats(userId: string) {
  const testResults = await prisma.testResult.aggregate({
    where: { userId },
    _count: { id: true },
    _sum: { score: true, total: true },
  });

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

  const accuracy =
    totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;

  return {
    totalTests,
    accuracy,
    totalQuestions,
    flashcardsCount,
  };
}

export async function getXpActivityForLast7Days(userId: string) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 6);
  startDate.setHours(0, 0, 0, 0);

  const logs = await prisma.xpLog.findMany({
    where: {
      userId,
      createdAt: { gte: startDate },
    },
    select: { amount: true, createdAt: true },
  });

  const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      dateStr: d.toDateString(),
      name: dayNames[d.getDay()],
      xp: 0,
    };
  });

  logs.forEach((log) => {
    const logDate = new Date(log.createdAt).toDateString();
    const dayRecord = last7Days.find((d) => d.dateStr === logDate);
    if (dayRecord) {
      dayRecord.xp += log.amount;
    }
  });

  return last7Days.map(({ name, xp }) => ({ name, xp }));
}
