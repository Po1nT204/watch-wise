import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportVideoToMarkdown } from '@/lib/export-utils';
import { VideoWithRelations, Flashcard, QuizQuestion } from '@/shared/types';

global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

describe('export-utils: exportVideoToMarkdown', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('должен генерировать markdown и триггерить скачивание', () => {
    const mockVideo = { title: 'Test Video' } as VideoWithRelations;
    const mockContent = { summary: 'Тестовое саммари' } as any;
    const mockFlashcards = [
      { term: 'Термин', definition: 'Определение' },
    ] as Flashcard[];
    const mockQuestions = [
      { text: 'Вопрос 1', options: ['A', 'B'], correctIdx: 0 },
    ] as QuizQuestion[];

    const createElementSpy = vi.spyOn(document, 'createElement');
    const appendChildSpy = vi.spyOn(document.body, 'appendChild');
    const removeChildSpy = vi.spyOn(document.body, 'removeChild');

    const mockAnchor = { href: '', download: '', click: vi.fn() };
    createElementSpy.mockReturnValue(mockAnchor as any);

    exportVideoToMarkdown(
      mockVideo,
      mockContent,
      mockFlashcards,
      mockQuestions,
    );

    expect(global.URL.createObjectURL).toHaveBeenCalled();

    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(mockAnchor.download).toBe('WatchWise_Test_Video.md');

    expect(appendChildSpy).toHaveBeenCalled();
    expect(mockAnchor.click).toHaveBeenCalled();
    expect(removeChildSpy).toHaveBeenCalled();
  });

  it('не должен ничего делать, если content отсутствует', () => {
    const createElementSpy = vi.spyOn(document, 'createElement');
    exportVideoToMarkdown({} as VideoWithRelations, undefined as any, [], []);
    expect(createElementSpy).not.toHaveBeenCalled();
  });
});
