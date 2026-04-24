'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlayCircle, VideoIcon, ExternalLink, Search } from 'lucide-react';
import { DeleteVideoButton } from './delete-video-button';
import { VideoTagsDialog } from './video-tags-dialog';
import { Tag, VideoWithRelations } from '@/shared/types';

interface VideosListClientProps {
  videos: VideoWithRelations[];
  allTags: Tag[];
}

export function VideosListClient({ videos, allTags }: VideosListClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [filterTag, setFilterTag] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Логика фильтрации и сортировки
  const filteredAndSortedVideos = videos
    .filter((video) => {
      // 1. Поиск по названию
      const matchesSearch = (video.title || '')
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      // 2. Фильтр по платформе
      const matchesPlatform =
        filterPlatform === 'all' || video.platform === filterPlatform;

      // 3. Фильтр по тегу (теги лежат в первом элементе массива progress)
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
            <Button
              variant='outline'
              onClick={() => {
                setSearchQuery('');
                setFilterPlatform('all');
                setFilterTag('all');
              }}
            >
              Сбросить фильтры
            </Button>
          </div>
        ) : (
          <div className='grid gap-4'>
            {filteredAndSortedVideos.map((video) => {
              const videoTags = video.progress?.[0]?.tags || [];

              return (
                <div
                  key={video.id}
                  className='group relative flex flex-col md:flex-row md:items-center p-4 rounded-xl border bg-card hover:shadow-md hover:border-primary/30 transition-all gap-4'
                >
                  <div className='h-12 w-12 rounded-lg bg-primary/10 hidden md:flex items-center justify-center shrink-0'>
                    <PlayCircle className='h-7 w-7 text-primary' />
                  </div>

                  <div className='flex-1 min-w-0'>
                    <p className='text-base font-bold truncate pr-8 text-foreground/90'>
                      {video.title || 'Без названия'}
                    </p>
                    <div className='flex flex-wrap items-center gap-3 mt-1.5'>
                      <Badge
                        variant='secondary'
                        className='uppercase text-[10px] font-black tracking-wider'
                      >
                        {video.platform}
                      </Badge>
                      <span className='text-[12px] text-muted-foreground font-medium'>
                        {new Date(video.createdAt).toLocaleDateString('ru-RU')}
                      </span>

                      {/* Бейджики тегов для этого видео */}
                      {videoTags.length > 0 && (
                        <div className='flex items-center gap-1.5 ml-2 border-l pl-3'>
                          {videoTags.slice(0, 3).map((tag: Tag) => (
                            <Badge
                              key={tag.id}
                              variant='outline'
                              className='text-[10px] bg-background'
                            >
                              {tag.name}
                            </Badge>
                          ))}
                          {videoTags.length > 3 && (
                            <span className='text-[10px] text-muted-foreground font-medium'>
                              +{videoTags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className='flex items-center gap-2 mt-2 md:mt-0 justify-between md:justify-end w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0'>
                    <VideoTagsDialog
                      videoId={video.id}
                      currentTags={videoTags}
                      allTags={allTags}
                    />

                    <div className='flex items-center gap-2'>
                      <DeleteVideoButton videoId={video.id} />
                      <Button
                        size='sm'
                        className='rounded-full font-semibold shadow-sm'
                        asChild
                      >
                        <Link href={`/dashboard/video/${video.id}`}>
                          Открыть <ExternalLink className='ml-2 h-3.5 w-3.5' />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
