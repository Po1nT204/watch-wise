'use client';

import { useEffect, useState } from 'react';
import { VideoPlayer } from './video-player';
import { VideoTabs } from './video-tabs';
import { AnalysisControl } from './analysis-control';
import { QuizOverlay } from './quiz-overlay';
import { useVideoStore } from '@/store/video';
import { saveQuizResult } from '@/server-actions/progress';
import { toast } from 'sonner';

export function VideoViewClient({ video }: { video: any }) {
  const [seekTo, setSeekTo] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);

  const { score, askedQuestionIds, incrementScore, addAskedQuestion, reset } =
    useVideoStore();

  const content = video?.generatedContents?.[0];
  const questions = content?.questions || [];

  // Сбрасываем стейт при монтировании нового видео
  useEffect(() => {
    reset();
  }, [video.id, reset]);

  const handleProgress = (currentTime: number) => {
    // Ищем вопрос, время которого подошло (с погрешностью в 1 сек)
    if (currentQuestion) return; // Если уже висит вопрос, ничего не делаем

    const found = questions.find(
      (q: any) =>
        // Проверяем, попало ли время (с небольшим окном)
        currentTime >= q.timestamp + 7 &&
        currentTime < q.timestamp + 9 &&
        !askedQuestionIds.includes(q.id),
    );

    if (found) {
      setCurrentQuestion(found);
      setIsPaused(true); // Отправляем проп в VideoPlayer
    }
  };

  const handleAnswer = async (isCorrect: boolean) => {
    if (isCorrect) incrementScore();
    addAskedQuestion(currentQuestion.id);

    const isLastQuestion = askedQuestionIds.length + 1 === questions.length;

    setCurrentQuestion(null);
    setIsPaused(false);

    if (isLastQuestion && content) {
      const finalScore = isCorrect ? score + 1 : score;
      const result = await saveQuizResult(
        content.id,
        video.id,
        finalScore,
        questions.length,
      );

      if (result.success) {
        toast.success(
          `Тест завершен! Результат: ${finalScore} из ${questions.length}`,
          {
            duration: 5000,
          },
        );
      } else {
        toast.error('Не удалось сохранить результат тестирования.');
      }
    }
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
