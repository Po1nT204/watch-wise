'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlayCircle, ExternalLink } from 'lucide-react';
import { DeleteVideoButton } from './delete-video-button';
import { VideoTagsDialog } from './video-tags-dialog';
import { Tag, VideoForList } from '@/shared/types';

interface VideoCardProps {
  video: VideoForList;
  allTags: Tag[];
}

export function VideoCard({ video, allTags }: VideoCardProps) {
  const videoTags = video.progress?.[0]?.tags || [];

  return (
    <div className='group relative flex flex-col md:flex-row md:items-center p-4 rounded-xl border bg-card hover:shadow-md hover:border-primary/30 transition-all gap-4 overflow-hidden'>
      <div className='h-12 w-12 rounded-lg bg-primary/10 hidden md:flex items-center justify-center shrink-0'>
        <PlayCircle className='h-7 w-7 text-primary' />
      </div>

      <div className='flex-1 min-w-0 w-full'>
        <p className='text-base font-bold truncate pr-2 text-foreground/90'>
          {video.title || 'Без названия'}
        </p>

        <div className='flex flex-wrap items-center gap-x-3 gap-y-2 mt-1.5'>
          <Badge
            variant='secondary'
            className='uppercase text-[10px] font-black tracking-wider shrink-0'
          >
            {video.platform}
          </Badge>
          <span className='text-[12px] text-muted-foreground font-medium shrink-0'>
            {new Date(video.createdAt).toLocaleDateString('ru-RU')}
          </span>

          {videoTags.length > 0 && (
            <div className='flex flex-wrap items-center gap-1.5 sm:ml-2 sm:border-l border-border/50 sm:pl-3'>
              {videoTags.slice(0, 3).map((tag: Tag) => (
                <Badge
                  key={tag.id}
                  variant='outline'
                  className='text-[10px] bg-background truncate max-w-[120px]'
                  title={tag.name}
                >
                  {tag.name}
                </Badge>
              ))}
              {videoTags.length > 3 && (
                <span className='text-[10px] text-muted-foreground font-medium shrink-0'>
                  +{videoTags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className='flex flex-row items-center justify-between md:justify-end gap-2 mt-2 md:mt-0 w-full md:w-auto shrink-0 border-t md:border-t-0 pt-3 md:pt-0'>
        <VideoTagsDialog
          videoId={video.id}
          currentTags={videoTags}
          allTags={allTags}
        />

        <div className='flex items-center gap-2'>
          <DeleteVideoButton videoId={video.id} />
          <Button
            size='sm'
            className='rounded-full font-semibold shadow-sm shrink-0'
            asChild
          >
            <Link href={`/dashboard/video/${video.id}`}>
              Открыть{' '}
              <ExternalLink className='ml-2 h-3.5 w-3.5 hidden sm:inline' />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
