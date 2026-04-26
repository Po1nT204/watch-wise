'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { VideoIcon, Search } from 'lucide-react';
import { Tag, VideoWithRelations } from '@/shared/types';
import { useVideoFilter } from '@/hooks/useVideoFilter';
import { VideoCard } from './video-card';

interface VideosListClientProps {
  videos: VideoWithRelations[];
  allTags: Tag[];
}

export function VideosListClient({ videos, allTags }: VideosListClientProps) {
  const {
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
  } = useVideoFilter(videos);

  return (
    <Card className='border-none shadow-none bg-transparent'>
      <CardHeader className='px-0 flex flex-col gap-4'>
        <div className='flex flex-col md:flex-row gap-4'>
          {/* Поиск */}
          <div className='relative flex-1'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Поиск видео...'
              className='pl-9 bg-background shadow-sm'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Фильтры и сортировки */}
          <div className='flex flex-wrap md:flex-nowrap gap-2'>
            <Select value={filterPlatform} onValueChange={setFilterPlatform}>
              <SelectTrigger className='w-[140px] bg-background shadow-sm'>
                <SelectValue placeholder='Платформа' />
              </SelectTrigger>
              <SelectContent
                position='popper'
                sideOffset={4}
                className='bg-background shadow-md'
              >
                <SelectItem value='all'>Все платформы</SelectItem>
                <SelectItem value='youtube'>YouTube</SelectItem>
                <SelectItem value='vk'>VK Video</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterTag} onValueChange={setFilterTag}>
              <SelectTrigger className='w-[140px] bg-background shadow-sm'>
                <SelectValue placeholder='Тег' />
              </SelectTrigger>
              <SelectContent
                position='popper'
                sideOffset={4}
                className='bg-background shadow-md'
              >
                <SelectItem value='all'>Все теги</SelectItem>
                {allTags.map((tag) => (
                  <SelectItem key={tag.id} value={tag.id}>
                    {tag.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className='w-[150px] bg-background shadow-sm'>
                <SelectValue placeholder='Сортировка' />
              </SelectTrigger>
              <SelectContent
                position='popper'
                sideOffset={4}
                className='bg-background shadow-md'
              >
                <SelectItem value='newest'>Сначала новые</SelectItem>
                <SelectItem value='oldest'>Сначала старые</SelectItem>
                <SelectItem value='name_asc'>Название (А-Я)</SelectItem>
                <SelectItem value='name_desc'>Название (Я-А)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <p className='text-sm text-muted-foreground'>
          Найдено видео: {filteredAndSortedVideos.length}
        </p>
      </CardHeader>

      <CardContent className='px-0'>
        {filteredAndSortedVideos.length === 0 ? (
          <div className='flex flex-col min-h-[300px] items-center justify-center rounded-xl border border-dashed bg-card/50 text-center'>
            <VideoIcon className='h-10 w-10 text-muted-foreground opacity-20' />
            <h3 className='mt-4 text-lg font-semibold'>Ничего не найдено</h3>
            <p className='mb-4 mt-2 text-sm text-muted-foreground'>
              Попробуйте изменить параметры поиска или фильтры.
            </p>
            <Button variant='outline' onClick={resetFilters}>
              Сбросить фильтры
            </Button>
          </div>
        ) : (
          <div className='grid gap-4'>
            {filteredAndSortedVideos.map((video) => (
              <VideoCard key={video.id} video={video} allTags={allTags} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
