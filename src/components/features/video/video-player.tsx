'use client';

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
  useEffect(() => {
    if (htmlVideoRef.current) {
      if (seekToTime !== null) {
        htmlVideoRef.current.currentTime = seekToTime;
        htmlVideoRef.current.play(); // Сразу запускаем после перемотки
        onSeekComplete();
      }

      if (isPaused) {
        htmlVideoRef.current.pause();
      } else {
        // Проверяем, не на паузе ли плеер уже, чтобы не дергать play вхолостую
        if (htmlVideoRef.current.paused && seekToTime === null) {
          htmlVideoRef.current.play().catch(() => {}); // Игнорируем ошибку автоплея
        }
      }
    }
  }, [seekToTime, isPaused, onSeekComplete]);

  // --- ЛОГИКА ДЛЯ YOUTUBE IFRAME ---
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
  }, [seekToTime, isReady, videoData, onSeekComplete]);

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
    if (videoData?.platform === 'youtube' && isReady && iframeRef.current) {
      const command = isPaused ? 'pauseVideo' : 'playVideo';
      iframeRef.current.contentWindow?.postMessage(
        JSON.stringify({ event: 'command', func: command, args: [] }),
        '*',
      );
    }
  }, [isPaused, isReady, videoData]);

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
            className='w-full h-full'
            onTimeUpdate={(e) => onProgress?.(e.currentTarget.currentTime)}
          />
        </div>
      );
    }

    // Пока видео не обработано (status PENDING/PROCESSING), показываем стандартный iframe VK как заглушку
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
