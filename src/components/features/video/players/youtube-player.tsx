'use client';

import { useEffect, useRef, useState } from 'react';
import { logger } from '@/config/logger';

interface YoutubePlayerProps {
  videoId: string;
  seekToTime: number | null;
  onSeekComplete: () => void;
  onProgress?: (currentTime: number) => void;
  isPaused?: boolean;
}

export function YoutubePlayer({
  videoId,
  seekToTime,
  onSeekComplete,
  onProgress,
  isPaused,
}: YoutubePlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  // 1. Перемотка
  useEffect(() => {
    if (seekToTime !== null && iframeRef.current && isReady) {
      iframeRef.current.contentWindow?.postMessage(
        JSON.stringify({
          event: 'command',
          func: 'seekTo',
          args: [seekToTime, true],
        }),
        '*',
      );
      iframeRef.current.contentWindow?.postMessage(
        JSON.stringify({ event: 'command', func: 'playVideo', args: [] }),
        '*',
      );
      onSeekComplete();
    }
  }, [seekToTime, isReady, onSeekComplete]);

  // 2. Опрос прогресса
  useEffect(() => {
    if (!isReady) return;

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

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (
          data.event === 'infoDelivery' &&
          data.info &&
          data.info.currentTime
        ) {
          onProgress?.(data.info.currentTime);
        }
        if (typeof data.info === 'number' && data.event !== 'onStateChange') {
          onProgress?.(data.info);
        }
      } catch (error) {
        logger.warn({ err: error }, 'Ошибка опроса прогресса YouTube');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      clearInterval(interval);
      window.removeEventListener('message', handleMessage);
    };
  }, [isReady, onProgress]);

  // 3. Пауза
  useEffect(() => {
    if (isReady && iframeRef.current) {
      const command = isPaused ? 'pauseVideo' : 'playVideo';
      iframeRef.current.contentWindow?.postMessage(
        JSON.stringify({ event: 'command', func: command, args: [] }),
        '*',
      );
    }
  }, [isPaused, isReady]);

  if (!origin) return null; // Предотвращаем SSR hydration mismatch

  return (
    <div className='relative aspect-video overflow-hidden rounded-xl border bg-black shadow-sm'>
      <iframe
        ref={iframeRef}
        className='absolute top-0 left-0 w-full h-full'
        src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${origin}`}
        title='YouTube video player'
        frameBorder='0'
        allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
        allowFullScreen
        onLoad={() => setIsReady(true)}
      />
    </div>
  );
}
