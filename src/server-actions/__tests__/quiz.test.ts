import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateQuizQuestion, deleteQuizQuestion } from '@/server-actions/quiz';
import prisma from '@/config/prisma';
import { auth } from '@/config/auth';

vi.mock('@/config/prisma', () => ({
  default: {
    quizQuestion: { findUnique: vi.fn(), update: vi.fn(), delete: vi.fn() },
  },
}));

vi.mock('@/config/auth', () => ({ auth: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/config/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

describe('Server Actions: Quiz', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('updateQuizQuestion', () => {
    it('должен запрещать редактирование, если вопрос принадлежит другому юзеру', async () => {
      // Имитируем авторизацию пользователя 'user-1'
      vi.mocked(auth).mockResolvedValue({ user: { id: 'user-1' } } as any);

      // В базе вопрос принадлежит 'user-2'
      vi.mocked(prisma.quizQuestion.findUnique).mockResolvedValue({
        id: 'q-1',
        content: { userId: 'user-2' }, // ЧУЖОЙ КОНТЕНТ
      } as any);

      const result = await updateQuizQuestion({
        id: 'q-1',
        videoId: 'v-1',
        text: 'Новый текст',
        timestamp: 10,
        options: ['1', '2'],
        correctIdx: 0,
      });

      expect(result.error).toBe('Нет прав для редактирования этого вопроса');
      expect(prisma.quizQuestion.update).not.toHaveBeenCalled();
    });

    it('должен разрешать редактирование владельцу', async () => {
      vi.mocked(auth).mockResolvedValue({ user: { id: 'user-1' } } as any);
      vi.mocked(prisma.quizQuestion.findUnique).mockResolvedValue({
        id: 'q-1',
        content: { userId: 'user-1' }, // СВОЙ КОНТЕНТ
      } as any);
      vi.mocked(prisma.quizQuestion.update).mockResolvedValue({} as any);

      const result = await updateQuizQuestion({
        id: 'q-1',
        videoId: 'v-1',
        text: 'Новый текст',
        timestamp: 10,
        options: ['1', '2'],
        correctIdx: 0,
      });

      expect(result.success).toBe(true);
      expect(prisma.quizQuestion.update).toHaveBeenCalled();
    });
  });
});
