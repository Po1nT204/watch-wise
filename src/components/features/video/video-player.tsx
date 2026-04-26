'use client';

import { parseVideoUrl } from '@/lib/utils';
import { Html5Player } from './players/html5-player';
import { YoutubePlayer } from './players/youtube-player';
import { VkPlayer } from './players/vk-player';

interface VideoPlayerProps {
  url: string;
  cloudUrl?: string | null;
  seekToTime: number | null;
  onSeekComplete: () => void;
  onProgress?: (currentTime: number) => void;
  isPaused?: boolean;
}

export function VideoPlayer({
  url,
  cloudUrl,
  seekToTime,
  onSeekComplete,
  onProgress,
  isPaused,
}: VideoPlayerProps) {
  const videoData = parseVideoUrl(url);

  if (!videoData) {
    return (
      <div className='aspect-video bg-muted flex items-center justify-center rounded-xl'>
        Неверная ссылка
      </div>
    );
  }

  // 1. Приоритет: если есть видео в S3, воспроизводим через нативный HTML5 плеер
  if (cloudUrl) {
    return (
      <Html5Player
        url={cloudUrl}
        seekToTime={seekToTime}
        onSeekComplete={onSeekComplete}
        onProgress={onProgress}
        isPaused={isPaused}
      />
    );
  }

  // 2. Если это VK (и нет cloudUrl) - показываем простой эмбед VK
  if (videoData.platform === 'vk') {
    const [ownerId, id] = videoData.id.split('_');
    return <VkPlayer ownerId={ownerId} videoId={id} />;
  }

  // 3. Если это YouTube - используем управляемый YouTube плеер
  if (videoData.platform === 'youtube') {
    return (
      <YoutubePlayer
        videoId={videoData.id}
        seekToTime={seekToTime}
        onSeekComplete={onSeekComplete}
        onProgress={onProgress}
        isPaused={isPaused}
      />
    );
  }

  return null;
}
