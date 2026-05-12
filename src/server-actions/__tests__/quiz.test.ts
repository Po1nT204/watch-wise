import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateQuizQuestion } from '@/server-actions/quiz';
import prisma from '@/config/prisma';
import { auth } from '@/config/auth';
import { QuizQuestion } from '@/shared/types';

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
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'user-1' },
      } as never);

      vi.mocked(prisma.quizQuestion.findUnique).mockResolvedValue({
        id: 'q-1',
        content: { userId: 'user-2' },
      } as unknown as QuizQuestion & { content: { userId: string } });

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
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'user-1' },
      } as never);
      vi.mocked(prisma.quizQuestion.findUnique).mockResolvedValue({
        id: 'q-1',
        content: { userId: 'user-1' },
      } as unknown as QuizQuestion & { content: { userId: string } });
      vi.mocked(prisma.quizQuestion.update).mockResolvedValue(
        {} as QuizQuestion,
      );

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
