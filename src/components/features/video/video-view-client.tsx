'use client';

import { useState } from 'react';
import { VideoPlayer } from './video-player';
import { VideoTabs } from './video-tabs';
import { AnalysisControl } from './analysis-control';

export function VideoViewClient({ video }: { video: any }) {
  const [seekTo, setSeekTo] = useState<number | null>(null);
  const [askedQuestions, setAskedQuestions] = useState<string[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const questions = video?.generatedContents?.[0]?.questions || [];

  const handleProgress = (currentTime: number) => {
    // Ищем вопрос, время которого подошло (с погрешностью в 1 сек)
    if (currentQuestion) return; // Если уже висит вопрос, ничего не делаем

    const found = questions.find(
      (q: any) =>
        // Проверяем, попало ли время (с небольшим окном)
        currentTime >= q.timestamp &&
        currentTime < q.timestamp + 1 &&
        !askedQuestions.includes(q.id),
    );

    if (found) {
      setAskedQuestions((prev) => [...prev, found.id]);
      setCurrentQuestion(found);
      setIsPaused(true); // Отправляем проп в VideoPlayer
    }
  };

  return (
    <div className='grid h-full gap-6 md:grid-cols-[1.5fr_1fr]'>
      <div className='flex flex-col gap-4'>
        <VideoPlayer
          url={video.url}
          seekToTime={seekTo}
          onSeekComplete={() => setSeekTo(null)}
          onProgress={handleProgress}
          isPaused={isPaused}
        />
        {currentQuestion && (
          <div className='absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-xl'>
            <div className='bg-background p-6 rounded-lg shadow-2xl max-w-md w-full'>
              <h3 className='text-lg font-bold mb-4'>{currentQuestion.text}</h3>
              <div className='grid gap-2 mb-6'>
                {currentQuestion.options.map((opt: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => {
                      // Тут будет логика проверки ответа
                      setCurrentQuestion(null);
                      setIsPaused(false);
                    }}
                    className='text-left p-3 border rounded-md hover:bg-primary/10 transition-colors'
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
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
