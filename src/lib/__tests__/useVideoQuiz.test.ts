import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useVideoQuiz } from '@/hooks/useVideoQuiz';
import { useVideoStore } from '@/store/video';
import { QuizQuestion } from '@/shared/types';

vi.mock('@/server-actions/progress', () => ({
  saveQuizResult: vi
    .fn()
    .mockResolvedValue({ success: true, earnedXp: 10, newLevel: 2 }),
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const mockQuestions = [
  {
    id: 'q1',
    text: 'Вопрос 1',
    timestamp: 1,
    options: ['А', 'Б'],
    correctIdx: 0,
  },
  {
    id: 'q2',
    text: 'Вопрос 2',
    timestamp: 11,
    options: ['В', 'Г'],
    correctIdx: 1,
  },
] as QuizQuestion[];

describe('useVideoQuiz Hook', () => {
  beforeEach(() => {
    useVideoStore.getState().reset();
    vi.clearAllMocks();
  });

  it('должен ставить видео на паузу при попадании в тайм-окно вопроса', () => {
    const { result } = renderHook(() =>
      useVideoQuiz(mockQuestions, 'content-1', 'video-1'),
    );
    expect(result.current.isPaused).toBe(false);

    act(() => {
      result.current.handleProgress(10);
    });

    expect(result.current.isPaused).toBe(true);
    expect(result.current.currentQuestion?.id).toBe('q1');
  });

  it('должен увеличивать счет при правильном ответе и снимать паузу', async () => {
    const { result } = renderHook(() =>
      useVideoQuiz(mockQuestions, 'content-1', 'video-1'),
    );
    act(() => result.current.handleProgress(10));

    await act(async () => {
      await result.current.handleAnswer(true);
    });

    expect(useVideoStore.getState().score).toBe(1);
    expect(useVideoStore.getState().askedQuestionIds).toContain('q1');
    expect(result.current.isPaused).toBe(false);
    expect(result.current.currentQuestion).toBeNull();
  });

  it('не должен реагировать на таймкод, если вопрос уже был задан', async () => {
    const { result } = renderHook(() =>
      useVideoQuiz(mockQuestions, 'content-1', 'video-1'),
    );

    act(() => result.current.handleProgress(10));
    await act(async () => {
      await result.current.handleAnswer(false);
    });

    act(() => result.current.handleProgress(10));

    expect(result.current.isPaused).toBe(false);
    expect(result.current.currentQuestion).toBeNull();
  });
});
