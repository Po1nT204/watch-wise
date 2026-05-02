import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registerUser, loginUser } from '@/server-actions/auth';
import prisma from '@/config/prisma';
import bcrypt from 'bcryptjs';
import { signIn } from '@/config/auth';

vi.mock('next-auth', () => ({
  AuthError: class extends Error {
    type: string;
    constructor(type: string) {
      super(type);
      this.type = type;
      this.name = 'AuthError';
    }
  },
}));

vi.mock('@/config/prisma', () => ({
  default: {
    user: { findUnique: vi.fn(), create: vi.fn() },
  },
}));

vi.mock('bcryptjs', () => ({
  default: { hash: vi.fn() },
}));

vi.mock('@/config/auth', () => ({
  signIn: vi.fn(),
}));

vi.mock('@/config/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

describe('Server Actions: Auth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('registerUser', () => {
    it('должен возвращать ошибку при невалидных данных (слабый пароль)', async () => {
      const result = await registerUser({
        name: 'Ivan',
        email: 'test@test.ru',
        password: '123',
      });
      expect(result.error).toBe('Неверные данные!');
      expect(prisma.user.findUnique).not.toHaveBeenCalled();
    });

    it('должен возвращать ошибку, если пользователь уже существует', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: '1',
        email: 'test@test.ru',
      } as any);

      const result = await registerUser({
        name: 'Ivan',
        email: 'test@test.ru',
        password: 'password123',
      });
      expect(result.error).toBe('Email уже используется!');
    });

    it('должен успешно создавать пользователя с хэшированным паролем', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed_pw_123' as never);
      vi.mocked(prisma.user.create).mockResolvedValue({ id: '1' } as any);

      const result = await registerUser({
        name: 'Ivan',
        email: 'new@test.ru',
        password: 'password123',
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: { name: 'Ivan', email: 'new@test.ru', password: 'hashed_pw_123' },
      });
      expect(result.success).toBe(
        'Пользователь создан! Теперь войдите в систему.',
      );
    });
  });

  describe('loginUser', () => {
    it('должен вызывать signIn с правильными параметрами', async () => {
      await loginUser({ email: 'test@test.ru', password: 'password123' });

      expect(signIn).toHaveBeenCalledWith('credentials', {
        email: 'test@test.ru',
        password: 'password123',
        redirectTo: '/dashboard',
      });
    });

    it('должен перехватывать и обрабатывать ошибку неверных учетных данных', async () => {
      const { AuthError } = await import('next-auth');
      const mockError = new AuthError('CredentialsSignin');

      vi.mocked(signIn).mockRejectedValue(mockError);

      const result = await loginUser({
        email: 'test@test.ru',
        password: 'wrong',
      });
      expect(result?.error).toBe('Неверный Email или пароль!');
    });
  });
});
