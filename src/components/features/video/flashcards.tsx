'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Flashcard {
  id: string;
  term: string;
  definition: string;
}

export function Flashcards({
  cards,
  activeIndex = 0,
}: {
  cards: Flashcard[];
  activeIndex?: number;
}) {
  const [currentIndex, setCurrentIndex] = useState(activeIndex);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    setCurrentIndex(activeIndex);
    setIsFlipped(true);
  }, [activeIndex]);

  if (!cards.length) return null;

  const currentCard = cards[currentIndex];

  const nextCard = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex((prev) => (prev + 1) % cards.length), 100);
  };

  const prevCard = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(false);
    setTimeout(
      () => setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length),
      100,
    );
  };

  return (
    <div className='flex flex-col items-center gap-3 w-full max-w-full overflow-hidden px-1'>
      <div
        className='relative w-full aspect-[4/3] min-h-[220px] cursor-pointer perspective-1000'
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div
          className={cn(
            'relative w-full h-full transition-all duration-500 preserve-3d shadow-md rounded-xl',
            isFlipped ? 'rotate-y-180' : '',
          )}
        >
          {/* Передняя сторона (Термин) */}
          <Card className='absolute inset-0 backface-hidden flex flex-col items-center justify-center p-4 text-center border-2 border-primary/10'>
            <span className='text-[10px] font-bold uppercase text-primary/40 mb-2 tracking-tighter'>
              Термин
            </span>
            <h2 className='text-lg font-bold leading-tight px-2'>
              {currentCard.term}
            </h2>
            <p className='absolute bottom-4 text-[10px] text-muted-foreground opacity-70'>
              Нажми, чтобы перевернуть
            </p>
          </Card>

          {/* Задняя сторона (Определение) */}
          <Card className='absolute inset-0 backface-hidden rotate-y-180 flex flex-col items-center justify-center p-5 text-center bg-primary text-primary-foreground border-none'>
            <ScrollArea className='h-full w-full'>
              <div className='flex flex-col items-center justify-center min-h-[180px]'>
                <span className='text-[10px] font-bold uppercase opacity-50 mb-2 tracking-tighter'>
                  Определение
                </span>
                <p className='text-sm font-medium leading-snug'>
                  {currentCard.definition}
                </p>
              </div>
            </ScrollArea>
          </Card>
        </div>
      </div>

      <div className='flex items-center justify-between w-full bg-muted/50 rounded-full px-2 py-1 border'>
        <Button
          variant='ghost'
          size='sm'
          onClick={prevCard}
          className='h-8 w-8 p-0 rounded-full hover:bg-background'
        >
          <ChevronLeft className='h-4 w-4' />
        </Button>

        <div className='flex items-center gap-2'>
          <span className='text-[11px] font-bold text-muted-foreground'>
            {currentIndex + 1} / {cards.length}
          </span>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => setIsFlipped(!isFlipped)}
            className='h-7 w-7 p-0 rounded-full opacity-60 hover:opacity-100'
          >
            <RotateCcw className='h-3 w-3' />
          </Button>
        </div>

        <Button
          variant='ghost'
          size='sm'
          onClick={nextCard}
          className='h-8 w-8 p-0 rounded-full hover:bg-background'
        >
          <ChevronRight className='h-4 w-4' />
        </Button>
      </div>
    </div>
  );
}
