import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getVideosByUserId, deleteVideoFromUser } from '@/services/video';
import prisma from '@/config/prisma';
import { Video } from '@prisma/client';

vi.mock('@/config/prisma', () => ({
  default: {
    video: { findMany: vi.fn() },
    videoProgress: { deleteMany: vi.fn() },
    generatedContent: { deleteMany: vi.fn() },
    $transaction: vi.fn(async (cb) => cb(prisma)),
  },
}));

vi.mock('@/config/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn() },
}));

describe('Video Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getVideosByUserId', () => {
    it('должен формировать правильный запрос (OR условие для прогресса и контента)', async () => {
      vi.mocked(prisma.video.findMany).mockResolvedValue([
        { id: 'v1' },
      ] as unknown as Video[]);

      await getVideosByUserId('user-1');

      expect(prisma.video.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { generatedContents: { some: { userId: 'user-1' } } },
            { progress: { some: { userId: 'user-1' } } },
          ],
        },
        orderBy: { createdAt: 'desc' },
        include: expect.any(Object),
      });
    });
  });

  describe('deleteVideoFromUser', () => {
    it('должен удалять прогресс и контент через транзакцию', async () => {
      await deleteVideoFromUser('v-1', 'user-1');

      expect(prisma.videoProgress.deleteMany).toHaveBeenCalledWith({
        where: { videoId: 'v-1', userId: 'user-1' },
      });
      expect(prisma.generatedContent.deleteMany).toHaveBeenCalledWith({
        where: { videoId: 'v-1', userId: 'user-1' },
      });
    });
  });
});
