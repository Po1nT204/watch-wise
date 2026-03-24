'use client';

import { useEffect, useRef } from 'react';

interface VKPlayerProps {
  videoId: string; // Формат "ownerId_videoId"
  onProgress?: (currentTime: number) => void;
  isPaused?: boolean;
}

export function VKPlayer({ videoId, onProgress, isPaused }: VKPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef(null);

  useEffect(() => {
    // 1. Динамически загружаем скрипт плеера VK, если его еще нет
    const scriptId = 'vk-player-sdk';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://vk.com/js/api/videoplayer.js';
      script.async = true;
      document.body.appendChild(script);
    }

    const initPlayer = () => {
      if (containerRef.current && (window as any).VK?.VideoPlayer) {
        const [ownerId, id] = videoId.split('_');

        // Создаем экземпляр плеера
        playerRef.current = new (window as any).VK.VideoPlayer(
          containerRef.current,
          {
            owner_id: parseInt(ownerId),
            video_id: parseInt(id),
            width: '100%',
            height: '100%',
            autoplay: 0,
          },
        );

        // Подписываемся на обновление времени
        playerRef.current.on('timeupdate', (data: { time: number }) => {
          if (onProgress) {
            onProgress(data.time);
          }
        });
      }
    };

    // Если скрипт уже загружен — инициализируем, иначе ждем загрузки
    if ((window as any).VK?.VideoPlayer) {
      initPlayer();
    } else {
      const script = document.getElementById(scriptId);
      script?.addEventListener('load', initPlayer);
    }

    return () => {
      // Чистим плеер при размонтировании
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [videoId, onProgress]);

  // Следим за состоянием паузы извне (Smart Pause)
  useEffect(() => {
    if (!playerRef.current) return;

    if (isPaused) {
      playerRef.current.pause();
    } else {
      playerRef.current.play();
    }
  }, [isPaused]);

  return (
    <div className='relative aspect-video overflow-hidden rounded-xl border bg-black shadow-sm'>
      <div ref={containerRef} className='absolute top-0 left-0 w-full h-full' />
    </div>
  );
}
