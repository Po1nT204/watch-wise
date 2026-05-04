import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AnalysisOrchestrator } from '@/services/analysis-orchestrator';
import { YoutubeService } from '@/services/youtube';
import { YandexCloudService } from '@/services/yandex';
import { VideoDownloader } from '@/services/video-downloader';
import { S3Service } from '@/services/s3';
import { SpeechKitService } from '@/services/speechkit';
import prisma from '@/config/prisma';
import { Video } from '@prisma/client';
import { TranscriptChunk } from '@/shared/types';

vi.mock('@/constants/app', () => ({
  APP_CONFIG: {
    API: {
      SPEECHKIT_POLLING_INTERVAL: 1,
    },
  },
}));

vi.mock('@/config/prisma', () => ({
  default: {
    video: { update: vi.fn(), findUnique: vi.fn() },
    transcriptChunk: { createMany: vi.fn() },
    $transaction: vi.fn(async (cb) => {
      return cb({
        generatedContent: {
          create: vi.fn().mockResolvedValue({ id: 'content-1' }),
        },
        quizQuestion: { createMany: vi.fn() },
        flashcard: { createMany: vi.fn() },
        tag: { upsert: vi.fn().mockResolvedValue({ id: 'tag-1' }) },
        videoProgress: { update: vi.fn() },
      });
    }),
  },
}));

vi.mock('@/services/youtube', () => ({
  YoutubeService: { fetchAndSaveTranscript: vi.fn() },
}));
vi.mock('@/services/yandex', () => ({
  YandexCloudService: { generateLearningContent: vi.fn() },
}));
vi.mock('@/services/video-downloader', () => ({
  VideoDownloader: { extractAudio: vi.fn(), extractVideo: vi.fn() },
}));
vi.mock('@/services/s3', () => ({
  S3Service: { uploadAudio: vi.fn(), uploadVideo: vi.fn() },
}));
vi.mock('@/services/speechkit', () => ({
  SpeechKitService: {
    createTask: vi.fn(),
    getTaskStatus: vi.fn(),
    getRecognitionResult: vi.fn(),
    parseV3Response: vi.fn(),
  },
}));

vi.mock('@/config/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

describe('AnalysisOrchestrator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockSettings = {
    mode: 'student',
    difficulty: 'medium',
    questionsCount: 5,
    audience: 'student',
    focus: 'theory',
  } as const;

  it('должен корректно обрабатывать YouTube видео с нативными субтитрами', async () => {
    vi.mocked(prisma.video.findUnique).mockResolvedValue({
      id: 'vid-1',
      url: 'https://youtube.com',
      platform: 'youtube',
      transcriptChunks: [],
    } as unknown as Video & { transcriptChunks: TranscriptChunk[] });

    vi.mocked(YoutubeService.fetchAndSaveTranscript).mockResolvedValue(
      '[0s] Привет мир',
    );
    vi.mocked(YandexCloudService.generateLearningContent).mockResolvedValue({
      content: { summary: 'Саммари', questions: [], flashcards: [], tags: [] },
      telemetry: { latencyMs: 100, tokensUsed: 50 },
    });

    await AnalysisOrchestrator.processVideo('vid-1', 'user-1', mockSettings);

    expect(prisma.video.update).toHaveBeenCalledWith({
      where: { id: 'vid-1' },
      data: { status: 'PROCESSING' },
    });
    expect(YoutubeService.fetchAndSaveTranscript).toHaveBeenCalled();
    expect(YandexCloudService.generateLearningContent).toHaveBeenCalledWith(
      '[0s] Привет мир',
      expect.any(Object),
    );
    expect(prisma.video.update).toHaveBeenCalledWith({
      where: { id: 'vid-1' },
      data: { status: 'COMPLETED' },
    });
    expect(VideoDownloader.extractAudio).not.toHaveBeenCalled();
  });

  it('должен запускать тяжелый пайплайн (скачивание -> S3 -> SpeechKit) для VK Video', async () => {
    vi.mocked(prisma.video.findUnique).mockResolvedValue({
      id: 'vid-vk',
      url: 'https://vk.com/video',
      platform: 'vk',
      transcriptChunks: [],
    } as unknown as Video & { transcriptChunks: TranscriptChunk[] });

    vi.mocked(VideoDownloader.extractAudio).mockResolvedValue('local.mp3');
    vi.mocked(VideoDownloader.extractVideo).mockResolvedValue('local.mp4');
    vi.mocked(S3Service.uploadAudio).mockResolvedValue('s3://audio');
    vi.mocked(S3Service.uploadVideo).mockResolvedValue('s3://video');

    vi.mocked(SpeechKitService.createTask).mockResolvedValue('task-123');
    vi.mocked(SpeechKitService.getTaskStatus).mockResolvedValue({
      done: true,
    } as never);
    vi.mocked(SpeechKitService.getRecognitionResult).mockResolvedValue(
      {} as never,
    );
    vi.mocked(SpeechKitService.parseV3Response).mockReturnValue([
      { startTime: 0, endTime: 1, text: 'Текст ВК' },
    ]);

    vi.mocked(YandexCloudService.generateLearningContent).mockResolvedValue({
      content: { summary: 'Саммари', questions: [], flashcards: [], tags: [] },
      telemetry: { latencyMs: 100, tokensUsed: 50 },
    });

    await AnalysisOrchestrator.processVideo('vid-vk', 'user-1', mockSettings);

    expect(VideoDownloader.extractAudio).toHaveBeenCalled();
    expect(S3Service.uploadAudio).toHaveBeenCalled();
    expect(SpeechKitService.createTask).toHaveBeenCalledWith('s3://audio');
    expect(SpeechKitService.parseV3Response).toHaveBeenCalled();
    expect(prisma.video.update).toHaveBeenCalledWith({
      where: { id: 'vid-vk' },
      data: { cloudUrl: 's3://video' },
    });
  });

  it('должен переводить статус в FAILED при любой критической ошибке', async () => {
    vi.mocked(prisma.video.findUnique).mockResolvedValue({
      id: 'vid-err',
      url: 'https://youtube.com',
      platform: 'youtube',
      transcriptChunks: [],
    } as unknown as Video & { transcriptChunks: TranscriptChunk[] });

    vi.mocked(YoutubeService.fetchAndSaveTranscript).mockResolvedValue('Текст');
    vi.mocked(YandexCloudService.generateLearningContent).mockRejectedValue(
      new Error('AI Dead'),
    );

    await expect(
      AnalysisOrchestrator.processVideo('vid-err', 'user-1', mockSettings),
    ).rejects.toThrow('AI Dead');

    expect(prisma.video.update).toHaveBeenCalledWith({
      where: { id: 'vid-err' },
      data: { status: 'FAILED' },
    });
  });
});
