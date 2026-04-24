'use client';

import { logger } from '@/config/logger';
import { parseVideoUrl } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';

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
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const htmlVideoRef = useRef<HTMLVideoElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [origin, setOrigin] = useState('');

  const videoData = parseVideoUrl(url);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  // --- ЛОГИКА ДЛЯ HTML5 ПЛЕЕРА (Наш S3 VK) ---

  // 1. Управление паузой/воспроизведением
  useEffect(() => {
    if (!htmlVideoRef.current) return;

    if (isPaused) {
      htmlVideoRef.current.pause();
    } else {
      // Игнорируем ошибку автоплея при первой загрузке страницы
      htmlVideoRef.current.play().catch(() => {});
    }
  }, [isPaused]);

  // 2. Управление перемоткой (seek)
  useEffect(() => {
    if (htmlVideoRef.current && seekToTime !== null) {
      htmlVideoRef.current.currentTime = seekToTime;
      htmlVideoRef.current.play().catch(() => {});
      onSeekComplete();
    }
    // Отключаем правило линтера, так как onSeekComplete меняет ссылку каждый рендер
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seekToTime]);

  // --- ЛОГИКА ДЛЯ YOUTUBE IFRAME ---

  // 1. Перемотка
  useEffect(() => {
    if (
      videoData?.platform === 'youtube' &&
      seekToTime !== null &&
      iframeRef.current &&
      isReady
    ) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seekToTime, isReady, videoData?.platform]);

  // 2. Опрос прогресса
  useEffect(() => {
    if (videoData?.platform !== 'youtube' || !isReady) return;

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
        logger.warn(
          { err: error },
          'Непредвиденная ошибка в момент опроса прогресса видео.',
        );
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      clearInterval(interval);
      window.removeEventListener('message', handleMessage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, videoData?.platform]);

  // 3. Пауза
  useEffect(() => {
    if (videoData?.platform === 'youtube' && isReady && iframeRef.current) {
      const command = isPaused ? 'pauseVideo' : 'playVideo';
      iframeRef.current.contentWindow?.postMessage(
        JSON.stringify({ event: 'command', func: command, args: [] }),
        '*',
      );
    }
  }, [isPaused, isReady, videoData?.platform]);

  if (!videoData) {
    return (
      <div className='aspect-video bg-muted flex items-center justify-center rounded-xl'>
        Неверная ссылка
      </div>
    );
  }

  // --- РЕНДЕР HTML5 ПЛЕЕРА ДЛЯ VK (ИЛИ ФОЛЛБЭКА) ---
  if (videoData.platform === 'vk' || cloudUrl) {
    if (cloudUrl) {
      return (
        <div className='relative aspect-video overflow-hidden rounded-xl border bg-black shadow-sm'>
          <video
            ref={htmlVideoRef}
            src={cloudUrl}
            controls
            preload='metadata'
            className='w-full h-full'
            onTimeUpdate={(e) => onProgress?.(e.currentTarget.currentTime)}
          />
        </div>
      );
    }

    const [ownerId, id] = videoData.id.split('_');
    return (
      <div className='relative aspect-video overflow-hidden rounded-xl border bg-black shadow-sm'>
        <iframe
          src={`https://vk.com/video_ext.php?oid=${ownerId}&id=${id}&hd=2`}
          className='absolute top-0 left-0 w-full h-full'
          allow='autoplay; encrypted-media; fullscreen;'
          frameBorder='0'
          allowFullScreen
        />
      </div>
    );
  }

  // --- РЕНДЕР YOUTUBE ---
  return (
    <div className='relative aspect-video overflow-hidden rounded-xl border bg-black shadow-sm'>
      <iframe
        ref={iframeRef}
        className='absolute top-0 left-0 w-full h-full'
        src={`https://www.youtube.com/embed/${videoData.id}?enablejsapi=1&origin=${origin}`}
        title='YouTube video player'
        frameBorder='0'
        allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
        allowFullScreen
        onLoad={() => setIsReady(true)}
      />
    </div>
  );
}
