'use client';

import { useState } from 'react';
import { VideoPlayer } from './video-player';
import { VideoTabs } from './video-tabs';
import { AnalysisControl } from './analysis-control';
import { QuizOverlay } from './quiz-overlay';

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

  const handleAnswer = (isCorrect: boolean) => {
    // Здесь позже можно добавить логику сохранения в БД
    setCurrentQuestion(null);
    setIsPaused(false);
  };

  return (
    <div className='grid h-full gap-6 md:grid-cols-[1.5fr_1fr] relative'>
      <div className='flex flex-col gap-4 relative'>
        <VideoPlayer
          url={video.url}
          seekToTime={seekTo}
          onSeekComplete={() => setSeekTo(null)}
          onProgress={handleProgress}
          isPaused={isPaused}
        />
        {currentQuestion && (
          <QuizOverlay question={currentQuestion} onAnswer={handleAnswer} />
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
