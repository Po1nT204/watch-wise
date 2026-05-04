import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getUserDashboardStats } from '@/services/analytics';
import prisma from '@/config/prisma';

vi.mock('@/config/prisma', () => ({
  default: {
    testResult: {
      aggregate: vi.fn(),
    },
    flashcard: {
      count: vi.fn(),
    },
  },
}));

describe('Analytics Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('должен корректно рассчитывать 100% точность', async () => {
    vi.mocked(prisma.testResult.aggregate).mockResolvedValue({
      _count: { id: 5 },
      _sum: { score: 50, total: 50 },
    } as never);

    vi.mocked(prisma.flashcard.count).mockResolvedValue(15);

    const stats = await getUserDashboardStats('user-1');

    expect(stats.totalTests).toBe(5);
    expect(stats.accuracy).toBe(100);
    expect(stats.flashcardsCount).toBe(15);
  });

  it('должен корректно обрабатывать ситуацию без тестов (защита от NaN / деления на 0)', async () => {
    vi.mocked(prisma.testResult.aggregate).mockResolvedValue({
      _count: { id: 0 },
      _sum: { score: null, total: null },
    } as never);

    vi.mocked(prisma.flashcard.count).mockResolvedValue(0);

    const stats = await getUserDashboardStats('new-user');

    expect(stats.totalTests).toBe(0);
    expect(stats.accuracy).toBe(0);
    expect(stats.totalQuestions).toBe(0);
  });

  it('должен рассчитывать частичную точность', async () => {
    vi.mocked(prisma.testResult.aggregate).mockResolvedValue({
      _count: { id: 2 },
      _sum: { score: 7, total: 10 },
    } as never);
    vi.mocked(prisma.flashcard.count).mockResolvedValue(2);

    const stats = await getUserDashboardStats('user-2');

    expect(stats.accuracy).toBe(70);
  });
});
