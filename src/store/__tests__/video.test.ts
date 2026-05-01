import { describe, it, expect, beforeEach } from 'vitest';
import { useVideoStore } from '@/store/video';

describe('Video Store (Zustand)', () => {
  beforeEach(() => {
    useVideoStore.getState().reset();
  });

  it('должен инициализироваться с нулевым счетом и пустым массивом вопросов', () => {
    const state = useVideoStore.getState();
    expect(state.score).toBe(0);
    expect(state.askedQuestionIds).toEqual([]);
  });

  it('incrementScore должен увеличивать счет ровно на 1', () => {
    useVideoStore.getState().incrementScore();
    expect(useVideoStore.getState().score).toBe(1);

    useVideoStore.getState().incrementScore();
    expect(useVideoStore.getState().score).toBe(2);
  });

  it('addAskedQuestion должен добавлять ID в конец массива', () => {
    useVideoStore.getState().addAskedQuestion('question-1');
    expect(useVideoStore.getState().askedQuestionIds).toEqual(['question-1']);

    useVideoStore.getState().addAskedQuestion('question-2');
    expect(useVideoStore.getState().askedQuestionIds).toEqual([
      'question-1',
      'question-2',
    ]);
  });

  it('reset должен полностью очищать счет и историю вопросов', () => {
    useVideoStore.getState().incrementScore();
    useVideoStore.getState().addAskedQuestion('question-99');

    expect(useVideoStore.getState().score).toBe(1);
    expect(useVideoStore.getState().askedQuestionIds).toHaveLength(1);

    useVideoStore.getState().reset();

    expect(useVideoStore.getState().score).toBe(0);
    expect(useVideoStore.getState().askedQuestionIds).toEqual([]);
  });
});
