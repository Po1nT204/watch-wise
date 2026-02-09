'use client';

import { useState } from 'react';
import { VideoPlayer } from './video-player';
import { VideoTabs } from './video-tabs';
import { AnalysisControl } from './analysis-control';

export function VideoViewClient({ video }: { video: any }) {
  const [seekTo, setSeekTo] = useState<number | null>(null);

  return (
    <div className='grid h-full gap-6 md:grid-cols-[1.5fr_1fr]'>
      <div className='flex flex-col gap-4'>
        <VideoPlayer
          url={video.url}
          seekToTime={seekTo}
          onSeekComplete={() => setSeekTo(null)}
        />
        <div className='p-4 bg-muted/30 rounded-lg border'>
          <p className='text-sm font-medium mb-3'>Управление анализом</p>
          <AnalysisControl videoId={video.id} status={video.status} />
        </div>
      </div>

      <div className='h-full overflow-hidden rounded-xl border bg-background shadow-sm'>
        <VideoTabs video={video} onTimestampClick={(time) => setSeekTo(time)} />
      </div>
    </div>
  );
}
