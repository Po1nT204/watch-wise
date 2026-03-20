'use client';

import { parseVideoUrl } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';
import { VKPlayer } from './vk-video-player';
interface VideoPlayerProps {
  url: string;
  seekToTime: number | null;
  onSeekComplete: () => void;
  onProgress?: (currentTime: number) => void;
  isPaused?: boolean;
}

export function VideoPlayer({
  url,
  seekToTime,
  onSeekComplete,
  onProgress,
  isPaused,
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

  useEffect(() => {
    if (videoData?.platform !== 'youtube' || !isReady) return;

    // Каждые 1000мс просим у YouTube текущее время
    const interval = setInterval(() => {
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: 'listening', id: 1 }),
        '*',
      );
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: 'command', func: 'getCurrentTime', args: [] }),
        '*',
      );
    }, 1000);

    // Слушаем ответ от iframe
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (
          data.event === 'infoDelivery' &&
          data.info &&
          data.info.currentTime
        ) {
          // 1 = playing
          // Можно обрабатывать старт
          onProgress?.(data.info.currentTime);
        }
        if (typeof data.info === 'number' && data.event !== 'onStateChange') {
          onProgress?.(data.info);
        }
      } catch (e) {
        console.error(e);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      clearInterval(interval);
      window.removeEventListener('message', handleMessage);
    };
  }, [isReady, videoData, onProgress]);

  useEffect(() => {
    if (!isReady || !iframeRef.current) return;

    const command = isPaused ? 'pauseVideo' : 'playVideo';

    iframeRef.current.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func: command, args: [] }),
      '*',
    );
  }, [isPaused, isReady]);

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
        src={`https://www.youtube.com/embed/${videoData.id}?enablejsapi=1&widgetid=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
        title='YouTube video player'
        frameBorder='0'
        allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
        allowFullScreen
        onLoad={() => setIsReady(true)}
      />
    </div>
  );
}
