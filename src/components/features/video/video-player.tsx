'use client';

import { parseVideoUrl } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';
import { VKPlayer } from './vk-video-player';
interface VideoPlayerProps {
  url: string;
  seekToTime: number | null;
  onSeekComplete: () => void;
}

export function VideoPlayer({
  url,
  seekToTime,
  onSeekComplete,
}: VideoPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isReady, setIsReady] = useState(false);

  const videoData = parseVideoUrl(url);

  // Следим за командой перемотки
  useEffect(() => {
    if (
      videoData?.platform === 'youtube' &&
      seekToTime !== null &&
      iframeRef.current &&
      isReady
    ) {
      // Отправляем команду напрямую в IFrame через postMessage (стандарт YouTube API)
      iframeRef.current.contentWindow?.postMessage(
        JSON.stringify({
          event: 'command',
          func: 'seekTo',
          args: [seekToTime, true],
        }),
        '*',
      );

      // Запускаем видео, если оно было на паузе
      iframeRef.current.contentWindow?.postMessage(
        JSON.stringify({
          event: 'command',
          func: 'playVideo',
          args: [],
        }),
        '*',
      );

      onSeekComplete();
    }
  }, [seekToTime, isReady, videoData, onSeekComplete]);

  if (!videoData) {
    return (
      <div className='aspect-video bg-muted flex items-center justify-center rounded-xl'>
        Неверная ссылка на видео
      </div>
    );
  }

  if (videoData.platform === 'vk') {
    return <VKPlayer videoId={videoData.id} />;
  }

  return (
    <div className='relative aspect-video overflow-hidden rounded-xl border bg-black shadow-sm'>
      <iframe
        ref={iframeRef}
        className='absolute top-0 left-0 w-full h-full'
        src={`https://www.youtube.com/embed/${videoData.id}?enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
        title='YouTube video player'
        frameBorder='0'
        allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
        allowFullScreen
        onLoad={() => setIsReady(true)}
      />
    </div>
  );
}
