import { describe, it, expect } from 'vitest';
import { parseTimestamp, formatDisplayTime } from '../time-utils';

describe('Time Utils', () => {
  describe('parseTimestamp', () => {
    it('должен корректно парсить формат [Xs]', () => {
      expect(parseTimestamp('[150s]')).toBe(150);
      expect(parseTimestamp('45s')).toBe(45);
    });

    it('должен корректно парсить формат MM:SS', () => {
      expect(parseTimestamp('[02:30]')).toBe(150);
      expect(parseTimestamp('01:05')).toBe(65);
    });

    it('должен возвращать 0 при неверном формате', () => {
      expect(parseTimestamp('invalid')).toBe(0);
    });

    it('должен возвращать 0 при пустой строке', () => {
      expect(parseTimestamp('')).toBe(0);
    });

    it('должен обрабатывать дробные секунды', () => {
      expect(formatDisplayTime(150.75)).toBe('[2:30]');
    });
  });

  describe('formatDisplayTime', () => {
    it('должен форматировать секунды в [MM:SS]', () => {
      expect(formatDisplayTime(150)).toBe('[2:30]');
      expect(formatDisplayTime(5)).toBe('[0:05]');
      expect(formatDisplayTime(65)).toBe('[1:05]');
    });
  });
});
