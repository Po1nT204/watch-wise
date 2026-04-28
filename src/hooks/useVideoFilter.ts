import { useState, useMemo } from 'react';
import { Tag, VideoForList } from '@/shared/types';

export function useVideoFilter(videos: VideoForList[]) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [filterTag, setFilterTag] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const filteredAndSortedVideos = useMemo(() => {
    return videos
      .filter((video) => {
        const matchesSearch = (video.title || '')
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const matchesPlatform =
          filterPlatform === 'all' || video.platform === filterPlatform;

        const videoTags = video.progress?.[0]?.tags || [];
        const matchesTag =
          filterTag === 'all' || videoTags.some((t: Tag) => t.id === filterTag);

        return matchesSearch && matchesPlatform && matchesTag;
      })
      .sort((a, b) => {
        if (sortBy === 'newest')
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        if (sortBy === 'oldest')
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        if (sortBy === 'name_asc')
          return (a.title || '').localeCompare(b.title || '');
        if (sortBy === 'name_desc')
          return (b.title || '').localeCompare(a.title || '');
        return 0;
      });
  }, [videos, searchQuery, filterPlatform, filterTag, sortBy]);

  const resetFilters = () => {
    setSearchQuery('');
    setFilterPlatform('all');
    setFilterTag('all');
  };

  return {
    searchQuery,
    setSearchQuery,
    filterPlatform,
    setFilterPlatform,
    filterTag,
    setFilterTag,
    sortBy,
    setSortBy,
    filteredAndSortedVideos,
    resetFilters,
  };
}
