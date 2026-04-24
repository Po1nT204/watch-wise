'use client';

import { useEffect, useState } from 'react';
import { VideoPlayer } from './video-player';
import { VideoTabs } from './video-tabs';
import { AnalysisControl } from './analysis-control';
import { QuizOverlay } from './quiz-overlay';
import { useVideoStore } from '@/store/video';
import { VideoWithRelations } from '@/shared/types';
import { useVideoQuiz } from '@/hooks/useVideoQuiz';

export function VideoViewClient({ video }: { video: VideoWithRelations }) {
  const [seekTo, setSeekTo] = useState<number | null>(null);
  const content = video?.generatedContents?.[0];
  const questions = content?.questions || [];
  const { isPaused, currentQuestion, handleProgress, handleAnswer } =
    useVideoQuiz(questions, content?.id, video.id);

  const { reset } = useVideoStore();

  useEffect(() => {
    reset();
  }, [video.id, reset]);

  return (
    <div className='grid h-full gap-6 md:grid-cols-[1.5fr_1fr] relative min-h-0'>
      <div className='flex flex-col gap-4 relative min-h-0 overflow-hidden'>
        <div className='relative w-full shrink-0'>
          <VideoPlayer
            url={video.url}
            cloudUrl={video.cloudUrl}
            seekToTime={seekTo}
            onSeekComplete={() => setSeekTo(null)}
            onProgress={handleProgress}
            isPaused={isPaused}
          />
          {currentQuestion && (
            <QuizOverlay question={currentQuestion} onAnswer={handleAnswer} />
          )}
        </div>
        <div className='flex-1 p-4 bg-muted/30 rounded-lg border overflow-y-auto custom-scrollbar'>
          <p className='text-sm font-medium mb-3'>Управление анализом</p>
          <AnalysisControl videoId={video.id} status={video.status} />
        </div>
      </div>

      <div className='h-full overflow-hidden rounded-xl border bg-background shadow-sm min-h-0'>
        <VideoTabs video={video} onTimestampClick={(time) => setSeekTo(time)} />
      </div>
    </div>
  );
}
