import { describe, it, expect, vi, beforeEach } from 'vitest';
import { saveQuizResult } from '@/server-actions/progress';
import prisma from '@/config/prisma';
import { auth } from '@/config/auth';
import { User } from '@prisma/client';

vi.mock('@/config/prisma', () => ({
  default: {
    user: { findUnique: vi.fn(), update: vi.fn() },
    testResult: { create: vi.fn() },
    videoProgress: { update: vi.fn() },
    $transaction: vi.fn(async (arr) => Promise.all(arr)),
  },
}));

vi.mock('@/config/auth', () => ({ auth: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/config/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn() },
}));

describe('Server Actions: Progress', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('должен начислять XP, сохранять результат и не менять стрик, если активность была сегодня', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1' },
    } as never);

    // Имитируем, что юзер уже был активен сегодня
    const today = new Date();
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user-1',
      xp: 50,
      level: 1,
      streak: 3,
      lastActiveAt: today,
    } as User);

    // 2 правильных ответа = 2 * 10 (XP_PER_CORRECT) + 5 (BONUS) = 25 XP
    const result = await saveQuizResult('content-1', 'video-1', 2, 5);

    expect(result.success).toBe(true);
    expect(result.earnedXp).toBe(25);

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: {
        xp: 75,
        level: 1,
        streak: 3, // Стрик остался 3
        lastActiveAt: expect.any(Date),
      },
    });
  });

  it('должен увеличивать стрик, если последняя активность была вчера', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1' },
    } as never);

    // Вчерашний день
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user-1',
      xp: 50,
      level: 1,
      streak: 3,
      lastActiveAt: yesterday,
    } as User);

    await saveQuizResult('content-1', 'video-1', 2, 5);

    // Стрик должен увеличиться до 4
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ streak: 4 }),
      }),
    );
  });

  it('должен сбрасывать стрик до 1, если юзер пропустил больше дня', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1' },
    } as never);

    // 3 дня назад
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 3);

    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user-1',
      xp: 50,
      level: 1,
      streak: 10,
      lastActiveAt: pastDate,
    } as User);

    await saveQuizResult('content-1', 'video-1', 2, 5);

    // Стрик сбросился
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ streak: 1 }),
      }),
    );
  });

  it('должен повышать уровень, если XP превышает порог', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1' },
    } as never);

    // Текущий XP 90. Получаем 25. Итого 115. Порог уровня (APP_CONFIG.GAMIFICATION.XP_PER_LEVEL) = 100. Новый уровень = 2.
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user-1',
      xp: 90,
      level: 1,
      streak: 1,
      lastActiveAt: new Date(),
    } as User);

    const result = await saveQuizResult('content-1', 'video-1', 2, 5);

    expect(result.isLevelUp).toBe(true);
    expect(result.newLevel).toBe(2);
  });
});
