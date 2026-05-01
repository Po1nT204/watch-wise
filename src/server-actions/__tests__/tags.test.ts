import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTag } from '@/server-actions/tags';
import prisma from '@/config/prisma';
import { auth } from '@/config/auth';
import { Tag } from '@/shared/types';

vi.mock('@/config/prisma', () => ({
  default: {
    tag: {
      create: vi.fn(),
    },
  },
}));

vi.mock('@/config/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/config/logger', () => ({
  logger: { error: vi.fn() },
}));

describe('Server Actions: createTag', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('должен отклонять запрос, если пользователь не авторизован', async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const result = await createTag('Новый тег');
    expect(result.error).toBe('Не авторизован');
  });

  it('должен возвращать ошибку при пустом имени тега', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-1' } } as any);

    const result = await createTag('   ');
    expect(result.error).toBe('Имя тега не может быть пустым');
  });

  it('должен успешно создавать тег и отсекать лишние пробелы (trim)', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-1' } } as any);
    const mockTag = {
      id: 'tag-1',
      name: 'Физика',
      color: '#6366f1',
      userId: 'user-1',
    };

    vi.mocked(prisma.tag.create).mockResolvedValue(mockTag as Tag);

    const result = await createTag(' Физика ');

    expect(prisma.tag.create).toHaveBeenCalledWith({
      data: { name: 'Физика', color: '#6366f1', userId: 'user-1' },
    });
    expect(result.success).toBe(true);
    expect(result.tag).toEqual(mockTag);
  });
});
