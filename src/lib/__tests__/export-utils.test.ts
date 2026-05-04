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
    const mockContent = { summary: 'Тестовое саммари' } as NonNullable<
      VideoWithRelations['generatedContents']
    >[0];
    const mockFlashcards = [
      { term: 'Термин', definition: 'Определение' },
    ] as Flashcard[];
    const mockQuestions = [
      { text: 'Вопрос 1', options: ['A', 'B'], correctIdx: 0 },
    ] as QuizQuestion[];

    const mockAnchor = document.createElement('a');
    mockAnchor.click = vi.fn();

    const createElementSpy = vi
      .spyOn(document, 'createElement')
      .mockReturnValue(mockAnchor);
    const appendChildSpy = vi
      .spyOn(document.body, 'appendChild')
      .mockImplementation((node) => node);
    const removeChildSpy = vi
      .spyOn(document.body, 'removeChild')
      .mockImplementation((node) => node);

    exportVideoToMarkdown(
      mockVideo,
      mockContent,
      mockFlashcards,
      mockQuestions,
    );

    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(mockAnchor.download).toBe('WatchWise_Test_Video.md');
    expect(appendChildSpy).toHaveBeenCalledWith(mockAnchor);
    expect(mockAnchor.click).toHaveBeenCalled();
    expect(removeChildSpy).toHaveBeenCalledWith(mockAnchor);
  });

  it('не должен ничего делать, если content отсутствует', () => {
    const createElementSpy = vi.spyOn(document, 'createElement');
    exportVideoToMarkdown(
      {} as VideoWithRelations,
      null as unknown as NonNullable<
        VideoWithRelations['generatedContents']
      >[0],
      [],
      [],
    );
    expect(createElementSpy).not.toHaveBeenCalled();
  });
});
