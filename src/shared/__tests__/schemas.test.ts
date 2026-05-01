import { describe, it, expect } from 'vitest';
import {
  VideoUrlSchema,
  RegisterSchema,
  EditQuestionSchema,
} from '@/shared/schemas';

describe('Zod Validation Schemas', () => {
  describe('VideoUrlSchema', () => {
    it('должна пропускать корректные ссылки YouTube и VK', () => {
      expect(
        VideoUrlSchema.safeParse({
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        }).success,
      ).toBe(true);
      expect(
        VideoUrlSchema.safeParse({ url: 'https://youtu.be/dQw4w9WgXcQ' })
          .success,
      ).toBe(true);
      expect(
        VideoUrlSchema.safeParse({
          url: 'https://vk.com/video-220056942_456239018',
        }).success,
      ).toBe(true);
    });

    it('должна отклонять чужие платформы и невалидные строки', () => {
      expect(
        VideoUrlSchema.safeParse({ url: 'https://rutube.ru/video/123' })
          .success,
      ).toBe(false);
      expect(VideoUrlSchema.safeParse({ url: 'just-text' }).success).toBe(
        false,
      );
      expect(VideoUrlSchema.safeParse({ url: '' }).success).toBe(false);
    });
  });

  describe('RegisterSchema', () => {
    it('должна требовать имя от 2 символов и пароль от 6', () => {
      const invalidData = { name: 'A', email: 'test@test.ru', password: '123' };
      const result = RegisterSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.format();
        expect(errors.name).toBeDefined();
        expect(errors.password).toBeDefined();
      }
    });
  });

  describe('EditQuestionSchema', () => {
    it('должна требовать минимум 2 варианта ответа', () => {
      const invalidData = {
        id: '1',
        videoId: '1',
        text: 'Вопрос',
        timestamp: 10,
        correctIdx: 0,
        options: ['Только один вариант'],
      };
      expect(EditQuestionSchema.safeParse(invalidData).success).toBe(false);
    });
  });
});
