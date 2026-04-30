import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useVideoFilter } from '@/hooks/useVideoFilter';
import { VideoForList } from '@/shared/types';

const mockVideos = [
  {
    id: '1',
    title: 'React Basics',
    platform: 'youtube',
    createdAt: new Date('2023-01-01').toISOString(),
    progress: [{ tags: [{ id: 'tag1', name: 'IT' }] }],
  },
  {
    id: '2',
    title: 'Advanced Math',
    platform: 'vk',
    createdAt: new Date('2023-02-01').toISOString(),
    progress: [{ tags: [{ id: 'tag2', name: 'Science' }] }],
  },
  {
    id: '3',
    title: 'React Hooks Deep Dive',
    platform: 'youtube',
    createdAt: new Date('2023-03-01').toISOString(),
    progress: [],
  },
] as unknown as VideoForList[];

describe('useVideoFilter Hook', () => {
  it('должен возвращать все видео по умолчанию (сортировка newest - сначала новые)', () => {
    const { result } = renderHook(() => useVideoFilter(mockVideos));

    expect(result.current.filteredAndSortedVideos).toHaveLength(3);
    expect(result.current.filteredAndSortedVideos[0].id).toBe('3');
  });

  it('должен корректно фильтровать по поисковому запросу (searchQuery)', () => {
    const { result } = renderHook(() => useVideoFilter(mockVideos));

    act(() => {
      result.current.setSearchQuery('react');
    });

    expect(result.current.filteredAndSortedVideos).toHaveLength(2);

    expect(
      result.current.filteredAndSortedVideos.find((v) => v.id === '2'),
    ).toBeUndefined();
  });

  it('должен фильтровать по платформе (filterPlatform)', () => {
    const { result } = renderHook(() => useVideoFilter(mockVideos));

    act(() => {
      result.current.setFilterPlatform('vk');
    });

    expect(result.current.filteredAndSortedVideos).toHaveLength(1);
    expect(result.current.filteredAndSortedVideos[0].platform).toBe('vk');
  });

  it('должен фильтровать по тегам (filterTag)', () => {
    const { result } = renderHook(() => useVideoFilter(mockVideos));

    act(() => {
      result.current.setFilterTag('tag1');
    });

    expect(result.current.filteredAndSortedVideos).toHaveLength(1);
    expect(result.current.filteredAndSortedVideos[0].id).toBe('1');
  });

  it('должен корректно сбрасывать фильтры (resetFilters)', () => {
    const { result } = renderHook(() => useVideoFilter(mockVideos));

    act(() => {
      result.current.setSearchQuery('math');
      result.current.setFilterPlatform('vk');
      result.current.resetFilters();
    });

    expect(result.current.searchQuery).toBe('');
    expect(result.current.filterPlatform).toBe('all');
    expect(result.current.filteredAndSortedVideos).toHaveLength(3);
  });
});
