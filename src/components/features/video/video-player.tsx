'use client';

import { useEffect, useRef, useState } from 'react';
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

  // Извлекаем ID видео из ссылки (поддерживает youtube.com и youtu.be)
  const getVideoId = (url: string) => {
    const regExp =
      /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[7].length === 11 ? match[7] : false;
  };

  const videoId = getVideoId(url);

  // Следим за командой перемотки
  useEffect(() => {
    if (seekToTime !== null && iframeRef.current && isReady) {
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
  }, [seekToTime, isReady, onSeekComplete]);

  if (!videoId) {
    return (
      <div className='aspect-video bg-muted flex items-center justify-center rounded-xl'>
        Неверная ссылка на видео
      </div>
    );
  }

  return (
    <div className='relative aspect-video overflow-hidden rounded-xl border bg-black shadow-sm'>
      <iframe
        ref={iframeRef}
        className='absolute top-0 left-0 w-full h-full'
        src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
        title='YouTube video player'
        frameBorder='0'
        allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
        allowFullScreen
        onLoad={() => setIsReady(true)}
      />
    </div>
  );
}
