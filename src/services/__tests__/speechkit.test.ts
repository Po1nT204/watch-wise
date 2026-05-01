import { describe, it, expect, vi } from 'vitest';
import { SpeechKitService } from '@/services/speechkit';
import { logger } from '@/config/logger';

vi.mock('@/config/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('SpeechKitService.parseV3Response', () => {
  it('должен корректно парсить массив объектов (стандартный успешный ответ)', () => {
    const mockResponse = [
      {
        result: {
          final: {
            alternatives: [
              {
                text: 'Привет, мир',
                words: [
                  { startTimeMs: '1000', endTimeMs: '1500' },
                  { startTimeMs: '1500', endTimeMs: '2000' },
                ],
              },
            ],
          },
        },
      },
    ];

    const result = SpeechKitService.parseV3Response(mockResponse);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      startTime: 1,
      endTime: 2,
      text: 'Привет, мир',
    });
  });

  it('должен корректно парсить строку со склеенным JSON (legacy format)', () => {
    const mockStringResponse = `{"result":{"final":{"alternatives":[{"text":"Первый блок","words":[{"startTimeMs":"0","endTimeMs":"1000"}]}]}}}{"result":{"final":{"alternatives":[{"text":"Второй блок","words":[{"startTimeMs":"1000","endTimeMs":"2000"}]}]}}}`;

    const result = SpeechKitService.parseV3Response(mockStringResponse);

    expect(result).toHaveLength(2);
    expect(result[0].text).toBe('Первый блок');
    expect(result[1].text).toBe('Второй блок');
  });

  it('должен обрабатывать структуру finalRefinement (если final отсутствует)', () => {
    const mockResponse = [
      {
        result: {
          finalRefinement: {
            normalizedText: {
              alternatives: [
                {
                  text: 'Уточненный текст',
                  words: [{ startTimeMs: '500', endTimeMs: '1500' }],
                },
              ],
            },
          },
        },
      },
    ];

    const result = SpeechKitService.parseV3Response(mockResponse);

    expect(result).toHaveLength(1);
    expect(result[0].text).toBe('Уточненный текст');
    expect(result[0].startTime).toBe(0.5);
  });

  it('должен возвращать пустой массив и логировать ошибку, если передан невалидный JSON', () => {
    const invalidJsonString = `{"result": {"final": invalid_json`;

    const result = SpeechKitService.parseV3Response(invalidJsonString);

    expect(result).toHaveLength(0);
    expect(logger.error).toHaveBeenCalled();
  });

  it('должен игнорировать пустые или неполные объекты (без alternatives или words)', () => {
    const incompleteResponse = [
      { result: {} },
      { result: { final: { alternatives: [] } } },
      { result: { final: { alternatives: [{ text: 'Без слов' }] } } },
    ];

    const result = SpeechKitService.parseV3Response(incompleteResponse);

    expect(result).toHaveLength(0);
  });
});
