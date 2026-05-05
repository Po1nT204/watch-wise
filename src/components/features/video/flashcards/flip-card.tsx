'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GlobalFlashcard } from '@/shared/types';

export function FlipCard({ card }: { card: GlobalFlashcard }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className='relative w-full aspect-[4/3] min-h-[200px] cursor-pointer perspective-1000 group'
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        className={cn(
          'relative w-full h-full transition-all duration-500 preserve-3d shadow-sm group-hover:shadow-lg rounded-xl',
          isFlipped ? 'rotate-y-180' : '',
        )}
      >
        {/* Передняя сторона */}
        <Card className='absolute inset-0 backface-hidden flex flex-col items-center justify-center p-4 text-center border-2 border-primary/10 bg-gradient-to-br from-background to-muted/50'>
          <span className='text-[10px] font-bold uppercase text-primary/40 mb-2 tracking-widest'>
            Термин
          </span>
          <h2 className='text-lg font-bold leading-tight px-2 text-foreground/90'>
            {card.term}
          </h2>
          <div className='absolute bottom-4 left-4 right-4 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity'>
            <span
              className='text-[10px] text-muted-foreground truncate max-w-[70%]'
              title={card.content.video.title || undefined}
            >
              {card.content.video.title || 'Видео'}
            </span>
            <span className='text-[10px] text-primary font-semibold border-b border-primary/30 border-dashed'>
              Повернуть
            </span>
          </div>
        </Card>

        {/* Задняя сторона */}
        <Card className='absolute inset-0 backface-hidden rotate-y-180 flex flex-col items-center justify-center p-5 text-center bg-primary text-primary-foreground border-none shadow-lg shadow-primary/20'>
          <ScrollArea className='h-full w-full custom-scrollbar-light'>
            <div className='flex flex-col items-center justify-center min-h-[160px]'>
              <p className='text-sm font-medium leading-snug'>
                {card.definition}
              </p>
            </div>
          </ScrollArea>
        </Card>
      </div>
    </div>
  );
}
