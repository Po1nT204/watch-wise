import { describe, it, expect } from 'vitest';
import { getYoutubeVideoId, parseVideoUrl, cn } from '../utils';

describe('General Utils', () => {
  describe('cn (Tailwind Merge)', () => {
    it('должен корректно объединять классы', () => {
      expect(cn('bg-red-500', 'text-white')).toBe('bg-red-500 text-white');
    });

    it('должен разрешать конфликты Tailwind классов', () => {
      // px-2 должно перезаписаться на px-4
      expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
    });
  });

  describe('getYoutubeVideoId', () => {
    it('должен извлекать ID из стандартной ссылки', () => {
      expect(
        getYoutubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
      ).toBe('dQw4w9WgXcQ');
    });

    it('должен извлекать ID из короткой ссылки (youtu.be)', () => {
      expect(getYoutubeVideoId('https://youtu.be/dQw4w9WgXcQ?si=123')).toBe(
        'dQw4w9WgXcQ',
      );
    });

    it('должен возвращать null для некорректной ссылки', () => {
      expect(getYoutubeVideoId('https://vk.com/video-123_456')).toBeNull();
      expect(getYoutubeVideoId('just-random-text')).toBeNull();
    });
  });

  describe('parseVideoUrl', () => {
    it('должен распознавать платформу YouTube', () => {
      const result = parseVideoUrl(
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      );
      expect(result).toEqual({ id: 'dQw4w9WgXcQ', platform: 'youtube' });
    });

    it('должен распознавать платформу VK Video', () => {
      const result = parseVideoUrl('https://vk.com/video-220056942_456239018');
      expect(result).toEqual({ id: '-220056942_456239018', platform: 'vk' });
    });

    it('должен возвращать null при неизвестной платформе', () => {
      expect(parseVideoUrl('https://rutube.ru/video/123/')).toBeNull();
    });
  });
});
