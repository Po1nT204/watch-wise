'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Flashcard {
  id: string;
  term: string;
  definition: string;
}

export function Flashcards({ cards }: { cards: Flashcard[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (!cards.length) return null;

  const currentCard = cards[currentIndex];

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex((prev) => (prev + 1) % cards.length), 150);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setTimeout(
      () => setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length),
      150,
    );
  };

  return (
    <div className='flex flex-col items-center gap-6 py-4'>
      {/* Сцена карточки */}
      <div
        className='relative w-full max-w-[350px] aspect-[3/4] cursor-pointer perspective-1000'
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div
          className={cn(
            'relative w-full h-full transition-all duration-500 preserve-3d shadow-xl rounded-2xl',
            isFlipped ? 'rotate-y-180' : '',
          )}
        >
          {/* Передняя сторона (Термин) */}
          <Card className='absolute inset-0 backface-hidden flex flex-col items-center justify-center p-8 text-center border-2 border-primary/20'>
            <span className='text-xs font-bold uppercase text-primary/50 mb-4 tracking-widest'>
              Термин
            </span>
            <h2 className='text-2xl font-black leading-tight'>
              {currentCard.term}
            </h2>
            <p className='mt-8 text-sm text-muted-foreground animate-bounce'>
              Нажми, чтобы узнать ответ
            </p>
          </Card>

          {/* Задняя сторона (Определение) */}
          <Card className='absolute inset-0 backface-hidden rotate-y-180 flex flex-col items-center justify-center p-8 text-center bg-primary text-primary-foreground border-none'>
            <span className='text-xs font-bold uppercase opacity-50 mb-4 tracking-widest'>
              Определение
            </span>
            <p className='text-lg font-medium leading-relaxed'>
              {currentCard.definition}
            </p>
          </Card>
        </div>
      </div>

      {/* Навигация */}
      <div className='flex items-center gap-4'>
        <Button
          variant='outline'
          size='icon'
          onClick={prevCard}
          className='rounded-full'
        >
          <ChevronLeft className='h-5 w-5' />
        </Button>
        <span className='text-sm font-bold min-w-12 text-center'>
          {currentIndex + 1} / {cards.length}
        </span>
        <Button
          variant='outline'
          size='icon'
          onClick={nextCard}
          className='rounded-full'
        >
          <ChevronRight className='h-5 w-5' />
        </Button>
        <Button
          variant='ghost'
          size='icon'
          onClick={() => setIsFlipped(!isFlipped)}
          className='ml-2 rounded-full'
        >
          <RotateCcw className='h-4 w-4' />
        </Button>
      </div>
    </div>
  );
}
