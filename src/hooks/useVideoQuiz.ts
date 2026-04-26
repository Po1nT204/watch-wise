import { useState, useCallback } from 'react';
import { useVideoStore } from '@/store/video';
import { saveQuizResult } from '@/server-actions/progress';
import { toast } from 'sonner';
import { QuizQuestion } from '@/shared/types';
import { APP_CONFIG } from '@/constants/app';

export function useVideoQuiz(
  questions: QuizQuestion[],
  contentId: string | undefined,
  videoId: string,
) {
  const [isPaused, setIsPaused] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(
    null,
  );

  const { score, askedQuestionIds, incrementScore, addAskedQuestion } =
    useVideoStore();

  const handleProgress = useCallback(
    (currentTime: number) => {
      if (currentQuestion) return;

      const found = questions.find(
        (q) =>
          currentTime >= q.timestamp + APP_CONFIG.QUIZ.TIME_WINDOW_START &&
          currentTime < q.timestamp + APP_CONFIG.QUIZ.TIME_WINDOW_END &&
          !askedQuestionIds.includes(q.id),
      );

      if (found) {
        setCurrentQuestion(found);
        setIsPaused(true);
      }
    },
    [currentQuestion, questions, askedQuestionIds],
  );

  const handleAnswer = async (isCorrect: boolean) => {
    if (!currentQuestion) return;
    if (isCorrect) incrementScore();
    addAskedQuestion(currentQuestion.id);

    const isLastQuestion = askedQuestionIds.length + 1 === questions.length;
    setCurrentQuestion(null);
    setIsPaused(false);

    if (isLastQuestion && contentId) {
      const finalScore = isCorrect ? score + 1 : score;
      const result = await saveQuizResult(
        contentId,
        videoId,
        finalScore,
        questions.length,
      );

      if (result.success) {
        toast.success(
          `Тест пройден: ${finalScore}/${questions.length}. Получено +${result.earnedXp} XP! 🚀`,
        );
        if (result.isLevelUp)
          toast.success(`🎉 Вы достигли ${result.newLevel} уровня!`);
      } else {
        toast.error('Не удалось сохранить результат.');
      }
    }
  };

  return {
    isPaused,
    currentQuestion,
    handleProgress,
    handleAnswer,
    setIsPaused,
  };
}
