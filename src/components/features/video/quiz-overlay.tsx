'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, PlayCircle, XCircle } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface QuizOverlayProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  question: any;
  onAnswer: (isCorrect: boolean) => void;
}

export function QuizOverlay({ question, onAnswer }: QuizOverlayProps) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleCheck = (idx: number) => {
    if (isSubmitted) return;
    setSelectedIdx(idx);
    setIsSubmitted(true);
  };

  const handleContinue = () => {
    const isCorrect = selectedIdx === question.correctIdx;
    onAnswer(isCorrect);
  };

  return (
    <div className='fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300'>
      <Card className='w-full max-w-2xl p-6 md:p-8 shadow-2xl flex flex-col max-h-[90vh] bg-background'>
        {/* Заголовок вопроса */}
        <div className='mb-6 shrink-0'>
          <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4 border border-primary/20'>
            Умная пауза
          </div>
          <h3 className='text-xl md:text-2xl font-bold leading-snug'>
            {question.text}
          </h3>
        </div>

        <ScrollArea className='flex-1 pr-4 -mr-4 custom-scrollbar'>
          <div className='grid gap-3'>
            {question.options.map((opt: string, i: number) => {
              const isCorrect = i === question.correctIdx;
              const isSelected = i === selectedIdx;

              return (
                <Button
                  key={i}
                  variant='outline'
                  className={cn(
                    // ИСПРАВЛЕНИЕ: Уменьшили шрифт до text-sm (было text-base), убрали лишние padding
                    'h-auto py-3 px-4 justify-start text-left whitespace-normal transition-all text-sm',
                    isSubmitted &&
                      isCorrect &&
                      'border-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/10 opacity-100 ring-1 ring-emerald-500',
                    isSubmitted &&
                      isSelected &&
                      !isCorrect &&
                      'border-destructive bg-destructive/10 hover:bg-destructive/10 opacity-100 ring-1 ring-destructive',
                    isSubmitted && !isCorrect && !isSelected && 'opacity-40',
                    !isSubmitted && 'hover:border-primary/50 hover:bg-muted',
                  )}
                  onClick={() => handleCheck(i)}
                  disabled={isSubmitted}
                >
                  <div className='flex items-center gap-3 w-full'>
                    {/* Визуальный индикатор выбора */}
                    <div className='shrink-0'>
                      {isSubmitted && isCorrect ? (
                        <CheckCircle2 className='h-5 w-5 text-emerald-500' />
                      ) : isSubmitted && isSelected && !isCorrect ? (
                        <XCircle className='h-5 w-5 text-destructive' />
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

          {/* Блок с пояснением */}
          {isSubmitted && (
            <div className='mt-5 animate-in slide-in-from-bottom-4 fade-in duration-500'>
              {question.explanation && (
                <div className='p-3 bg-muted/50 rounded-lg border-l-4 border-primary text-sm mb-5'>
                  <span className='font-black block mb-1 uppercase tracking-wider text-[10px] text-primary'>
                    Пояснение ИИ:
                  </span>
                  <span className='text-muted-foreground leading-snug'>
                    {question.explanation}
                  </span>
                </div>
              )}

              <Button
                onClick={handleContinue}
                className='w-full font-bold shadow-md shadow-primary/20 mt-2 mb-2'
                size='lg'
              >
                <PlayCircle className='mr-2 h-5 w-5' />
                Продолжить просмотр
              </Button>
            </div>
          )}
        </ScrollArea>
      </Card>
    </div>
  );
}
