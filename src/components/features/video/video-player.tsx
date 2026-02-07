'use client';

import { useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import { usePlayerStore } from '@/store/use-player-store';

interface VideoPlayerProps {
  url: string;
}

export function VideoPlayer({ url }: VideoPlayerProps) {
  const [isMounted, setIsMounted] = useState(false);
  const playerRef = useRef<any>(null);

  const seekToTime = usePlayerStore((state) => state.seekToTime);
  const seekNonce = usePlayerStore((state) => state.seekNonce);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (playerRef.current && seekToTime !== null) {
      // Вызываем метод у локального рефа
      playerRef.current.seekTo(seekToTime, 'seconds');
    }
  }, [seekToTime, seekNonce]);

  if (!isMounted) {
    return (
      <div className='relative aspect-video overflow-hidden rounded-xl border bg-muted animate-pulse' />
    );
  }

  return (
    <div className='relative aspect-video overflow-hidden rounded-xl border bg-black shadow-sm'>
      <ReactPlayer
        ref={playerRef}
        src={url}
        width='100%'
        height='100%'
        controls={true}
        // onProgress={onProgress as any}
        // config={{
        //   youtube: {
        //     playerVars: {
        //       rel: 0,
        //       modestbranding: 1,
        //     } as any,
        //   },
        // }}
        style={{ position: 'absolute', top: 0, left: 0 }}
      />
    </div>
  );
}
