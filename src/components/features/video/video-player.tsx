'use client';

import { useEffect, useState } from 'react';
import ReactPlayer from 'react-player';

interface VideoPlayerProps {
  url: string;
  onProgress?: (state: { playedSeconds: number }) => void;
}

export function VideoPlayer({ url, onProgress }: VideoPlayerProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className='relative aspect-video overflow-hidden rounded-xl border bg-muted animate-pulse' />
    );
  }

  return (
    <div className='relative aspect-video overflow-hidden rounded-xl border bg-black shadow-sm'>
      <ReactPlayer
        src={url}
        width='100%'
        height='100%'
        controls={true}
        onProgress={onProgress as any}
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
