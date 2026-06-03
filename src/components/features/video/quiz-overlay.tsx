'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, PlayCircle, XCircle, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { QuizQuestion } from '@/shared/types';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { motion } from 'framer-motion';

interface QuizOverlayProps {
  question: QuizQuestion;
  onAnswer: (isCorrect: boolean) => void;
}

export function QuizOverlay({ question, onAnswer }: QuizOverlayProps) {
  const SECONDS_LIMIT = 30;
  const [timeLeft, setTimeLeft] = useState(SECONDS_LIMIT);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { width, height } = useWindowSize();

  useEffect(() => {
    if (isSubmitted) return;

    if (timeLeft <= 0) {
      setIsSubmitted(true);
      const timeout = setTimeout(() => {
        onAnswer(false);
      }, 1500);
      return () => clearTimeout(timeout);
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, isSubmitted, onAnswer]);

  const handleCheck = (idx: number) => {
    if (isSubmitted) return;
    setSelectedIdx(idx);
    setIsSubmitted(true);
  };

  const isCorrectAnswer = selectedIdx === question.correctIdx;

  const handleContinue = () => {
    onAnswer(isCorrectAnswer);
  };

  const options = question.options as string[];
  const progressPercentage = (timeLeft / SECONDS_LIMIT) * 100;

  return (
    <div className='fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300'>
      {isSubmitted && selectedIdx !== null && isCorrectAnswer && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={400}
          gravity={0.15}
        />
      )}

      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.4 }}
        className='w-full max-w-2xl'
      >
        <Card className='w-full p-6 md:p-8 shadow-2xl flex flex-col max-h-[90vh] bg-background relative overflow-hidden'>
          {isSubmitted && (
            <div
              className={cn(
                'absolute inset-0 opacity-5 pointer-events-none transition-colors duration-1000',
                selectedIdx === null
                  ? 'bg-destructive'
                  : isCorrectAnswer
                    ? 'bg-emerald-500'
                    : 'bg-destructive',
              )}
            />
          )}

          {!isSubmitted && (
            <div className='absolute top-0 left-0 h-1 bg-muted w-full shrink-0'>
              <div
                className={cn(
                  'h-full transition-all duration-1000 ease-linear',
                  timeLeft <= 10 ? 'bg-destructive' : 'bg-primary',
                )}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          )}

          <div className='mb-6 shrink-0 relative z-10 flex items-center justify-between gap-4'>
            <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider border border-primary/20'>
              Умная пауза
            </div>

            {!isSubmitted ? (
              <div
                className={cn(
                  'flex items-center gap-1.5 text-xs font-mono font-bold',
                  timeLeft <= 10
                    ? 'text-destructive animate-pulse'
                    : 'text-muted-foreground',
                )}
              >
                <Clock className='h-3.5 w-3.5' />
                {timeLeft} сек.
              </div>
            ) : selectedIdx === null && timeLeft <= 0 ? (
              <div className='text-xs font-bold text-destructive uppercase tracking-wider animate-bounce'>
                Время истекло!
              </div>
            ) : null}
          </div>

          <div className='mb-6 shrink-0 relative z-10'>
            <h3 className='text-xl md:text-2xl font-bold leading-snug'>
              {question.text}
            </h3>
          </div>

          <ScrollArea className='flex-1 pr-4 -mr-4 custom-scrollbar relative z-10'>
            <div className='grid gap-3'>
              {options.map((opt: string, i: number) => {
                const isCorrect = i === question.correctIdx;
                const isSelected = i === selectedIdx;

                return (
                  <Button
                    key={i}
                    variant='outline'
                    className={cn(
                      'h-auto py-3 px-4 justify-start text-left whitespace-normal transition-all text-sm',
                      isSubmitted &&
                        isCorrect &&
                        'border-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/10 opacity-100 ring-1 ring-emerald-500 transform scale-[1.02]',
                      isSubmitted &&
                        isSelected &&
                        !isCorrect &&
                        'border-destructive bg-destructive/10 hover:bg-destructive/10 opacity-100 ring-1 ring-destructive',
                      isSubmitted &&
                        !isCorrect &&
                        !isSelected &&
                        'opacity-40 grayscale',
                      !isSubmitted &&
                        'hover:border-primary/50 hover:bg-muted hover:translate-x-1',
                    )}
                    onClick={() => handleCheck(i)}
                    disabled={isSubmitted}
                  >
                    <div className='flex items-center gap-3 w-full'>
                      <div className='shrink-0'>
                        {isSubmitted && isCorrect ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                          >
                            <CheckCircle2 className='h-5 w-5 text-emerald-500' />
                          </motion.div>
                        ) : isSubmitted && isSelected && !isCorrect ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                          >
                            <XCircle className='h-5 w-5 text-destructive' />
                          </motion.div>
                        ) : (
                          <div className='h-5 w-5 rounded-full border-2 border-muted-foreground/30' />
                        )}
                      </div>
                      <span className='flex-1 font-medium leading-tight'>
                        {opt}
                      </span>
                    </div>
                  </Button>
                );
              })}
            </div>

            {isSubmitted && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className='mt-5'
              >
                {question.explanation && (
                  <div className='p-4 bg-muted/50 rounded-xl border-l-4 border-primary text-sm mb-5 shadow-inner'>
                    <span className='font-black block mb-1 uppercase tracking-wider text-[10px] text-primary'>
                      🧠 Пояснение ИИ:
                    </span>
                    <span className='text-muted-foreground leading-snug'>
                      {question.explanation}
                    </span>
                  </div>
                )}

                <Button
                  onClick={handleContinue}
                  className={cn(
                    'w-full font-bold shadow-lg mt-2 mb-2',
                    selectedIdx !== null && isCorrectAnswer
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                      : 'bg-primary',
                  )}
                  size='lg'
                >
                  <PlayCircle className='mr-2 h-5 w-5' />
                  Продолжить просмотр
                </Button>
              </motion.div>
            )}
          </ScrollArea>
        </Card>
      </motion.div>
    </div>
  );
}
