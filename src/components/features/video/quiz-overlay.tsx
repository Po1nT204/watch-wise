'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle } from 'lucide-react';
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

    const isCorrect = idx === question.correctIdx;
    setTimeout(() => onAnswer(isCorrect), 2000); // Даем 2 сек посмотреть на результат
  };

  return (
    <div className='absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-xl p-4'>
      <Card className='w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-300'>
        <h3 className='text-xl font-bold mb-6 leading-tight'>
          {question.text}
        </h3>

        <div className='grid gap-3'>
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
                    'border-green-500 bg-green-500/10 hover:bg-green-500/10',
                  isSubmitted &&
                    isSelected &&
                    !isCorrect &&
                    'border-destructive bg-destructive/10 hover:bg-destructive/10',
                )}
                onClick={() => handleCheck(i)}
                disabled={isSubmitted}
              >
                <div className='flex items-center gap-3'>
                  {isSubmitted && isCorrect && (
                    <CheckCircle2 className='h-5 w-5 text-green-500' />
                  )}
                  {isSubmitted && isSelected && !isCorrect && (
                    <XCircle className='h-5 w-5 text-destructive' />
                  )}
                  <span>{opt}</span>
                </div>
              </Button>
            );
          })}
        </div>

        {isSubmitted && (
          <p className='mt-4 text-sm text-muted-foreground italic animate-in slide-in-from-bottom-2'>
            {question.explanation}
          </p>
        )}
      </Card>
    </div>
  );
}
