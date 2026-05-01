import { describe, it, expect, vi, beforeEach } from 'vitest';
import { YoutubeService } from '@/services/youtube';
import { YoutubeTranscript } from 'youtube-transcript';
import prisma from '@/config/prisma';

vi.mock('youtube-transcript', () => ({
  YoutubeTranscript: { fetchTranscript: vi.fn() },
}));

vi.mock('@/config/prisma', () => ({
  default: { transcriptChunk: { createMany: vi.fn() } },
}));

vi.mock('@/config/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn() },
}));

describe('YoutubeService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('должен выкачивать транскрипт, сохранять чанки в БД и возвращать склеенный текст', async () => {
    const mockTranscript = [
      { offset: 1000, duration: 2000, text: 'Первая фраза' },
      { offset: 4000, duration: 1000, text: 'Вторая фраза' },
    ];
    vi.mocked(YoutubeTranscript.fetchTranscript).mockResolvedValue(
      mockTranscript as any,
    );

    const resultText = await YoutubeService.fetchAndSaveTranscript(
      'https://youtube.com/watch',
      'video-123',
    );

    expect(YoutubeTranscript.fetchTranscript).toHaveBeenCalledWith(
      'https://youtube.com/watch',
      { lang: 'ru' },
    );

    expect(prisma.transcriptChunk.createMany).toHaveBeenCalledWith({
      data: [
        {
          videoId: 'video-123',
          startTime: 1,
          endTime: 3,
          text: 'Первая фраза',
        },
        {
          videoId: 'video-123',
          startTime: 4,
          endTime: 5,
          text: 'Вторая фраза',
        },
      ],
    });

    expect(resultText).toBe('[1s] Первая фраза [4s] Вторая фраза');
  });

  it('должен выбрасывать понятную ошибку, если у видео нет субтитров', async () => {
    vi.mocked(YoutubeTranscript.fetchTranscript).mockResolvedValue([]);

    await expect(
      YoutubeService.fetchAndSaveTranscript(
        'https://youtube.com/watch',
        'video-123',
      ),
    ).rejects.toThrow('Не удалось получить субтитры для видео с youtube');
  });
});
