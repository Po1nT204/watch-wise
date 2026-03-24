'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, PlayCircle, XCircle } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface QuizOverlayProps {
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
    <div className='absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-xl p-4'>
      <Card className='w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-300 flex flex-col max-h-full'>
        <h3 className='text-xl font-bold mb-6 leading-tight'>
          {question.text}
        </h3>

        <div className='grid gap-3 flex-1 overflow-y-auto'>
          {question.options.map((opt: string, i: number) => {
            const isCorrect = i === question.correctIdx;
            const isSelected = i === selectedIdx;

            return (
              <Button
                key={i}
                variant='outline'
                className={cn(
                  'h-auto py-4 px-4 justify-start text-left whitespace-normal transition-all',
                  isSubmitted &&
                    isCorrect &&
                    'border-green-500 bg-green-500/10 hover:bg-green-500/10 opacity-100',
                  isSubmitted &&
                    isSelected &&
                    !isCorrect &&
                    'border-destructive bg-destructive/10 hover:bg-destructive/10 opacity-100',
                  isSubmitted && !isCorrect && !isSelected && 'opacity-50',
                )}
                onClick={() => handleCheck(i)}
                disabled={isSubmitted}
              >
                <div className='flex items-center gap-3'>
                  {isSubmitted && isCorrect && (
                    <CheckCircle2 className='h-5 w-5 text-green-500 shrink-0' />
                  )}
                  {isSubmitted && isSelected && !isCorrect && (
                    <XCircle className='h-5 w-5 text-destructive shrink-0' />
                  )}
                  <span>{opt}</span>
                </div>
              </Button>
            );
          })}
        </div>

        {isSubmitted && (
          <div className='mt-6 space-y-4 animate-in slide-in-from-bottom-2'>
            {question.explanation && (
              <p className='text-sm text-muted-foreground italic border-l-2 pl-3 py-1 border-primary/50'>
                {question.explanation}
              </p>
            )}
            <Button
              onClick={handleContinue}
              className='w-full font-bold'
              size='lg'
            >
              <PlayCircle className='mr-2 h-5 w-5' />
              Продолжить просмотр
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
