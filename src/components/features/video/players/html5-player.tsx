'use client';

import { useEffect, useRef } from 'react';

interface Html5PlayerProps {
  url: string;
  seekToTime: number | null;
  onSeekComplete: () => void;
  onProgress?: (currentTime: number) => void;
  isPaused?: boolean;
}

export function Html5Player({
  url,
  seekToTime,
  onSeekComplete,
  onProgress,
  isPaused,
}: Html5PlayerProps) {
  const htmlVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!htmlVideoRef.current) return;
    if (isPaused) {
      htmlVideoRef.current.pause();
    } else {
      htmlVideoRef.current.play().catch(() => {});
    }
  }, [isPaused]);

  useEffect(() => {
    if (htmlVideoRef.current && seekToTime !== null) {
      htmlVideoRef.current.currentTime = seekToTime;
      htmlVideoRef.current.play().catch(() => {});
      onSeekComplete();
    }
  }, [seekToTime, onSeekComplete]);

  return (
    <div className='relative aspect-video overflow-hidden rounded-xl border bg-black shadow-sm'>
      <video
        ref={htmlVideoRef}
        src={url}
        controls
        preload='metadata'
        className='w-full h-full'
        onTimeUpdate={(e) => onProgress?.(e.currentTarget.currentTime)}
      />
    </div>
  );
}
