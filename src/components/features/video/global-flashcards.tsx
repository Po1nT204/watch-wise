'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

function FlipCard({ card }: { card: any }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className='relative w-full aspect-[4/3] min-h-[200px] cursor-pointer perspective-1000'
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        className={cn(
          'relative w-full h-full transition-all duration-500 preserve-3d shadow-sm hover:shadow-md rounded-xl',
          isFlipped ? 'rotate-y-180' : '',
        )}
      >
        {/* Передняя сторона */}
        <Card className='absolute inset-0 backface-hidden flex flex-col items-center justify-center p-4 text-center border-2 border-primary/10'>
          <span className='text-[10px] font-bold uppercase text-primary/40 mb-2 tracking-tighter'>
            Термин
          </span>
          <h2 className='text-lg font-bold leading-tight px-2'>{card.term}</h2>
          <div className='absolute bottom-4 left-4 right-4 flex justify-between items-center'>
            <span
              className='text-[10px] text-muted-foreground truncate max-w-[70%] opacity-60'
              title={card.content.video.title}
            >
              {card.content.video.title || 'Видео'}
            </span>
            <span className='text-[10px] text-muted-foreground opacity-70 border-b border-dashed'>
              Перевернуть
            </span>
          </div>
        </Card>

        {/* Задняя сторона */}
        <Card className='absolute inset-0 backface-hidden rotate-y-180 flex flex-col items-center justify-center p-5 text-center bg-primary text-primary-foreground border-none'>
          <ScrollArea className='h-full w-full'>
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

export function GlobalFlashcards({ cards }: { cards: any[] }) {
  const [search, setSearch] = useState('');

  const filteredCards = cards.filter(
    (c) =>
      c.term.toLowerCase().includes(search.toLowerCase()) ||
      c.definition.toLowerCase().includes(search.toLowerCase()) ||
      c.content.video.title?.toLowerCase().includes(search.toLowerCase()),
  );

  if (!cards.length) {
    return (
      <div className='flex flex-col items-center justify-center h-[400px] text-muted-foreground border border-dashed rounded-xl text-center p-6'>
        <p>
          У вас пока нет сохраненных карточек. Запустите анализ любого видео!
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='relative max-w-md'>
        <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
        <Input
          placeholder='Поиск по терминам или названию видео...'
          className='pl-9 bg-background shadow-sm'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filteredCards.length === 0 ? (
        <p className='text-muted-foreground'>
          По вашему запросу ничего не найдено.
        </p>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
          {filteredCards.map((card) => (
            <FlipCard key={card.id} card={card} />
          ))}
        </div>
      )}
    </div>
  );
}
