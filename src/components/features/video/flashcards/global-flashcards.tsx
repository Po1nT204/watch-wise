'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search, BrainCircuit, Play } from 'lucide-react';
import { GlobalFlashcard } from '@/shared/types';
import { Button } from '@/components/ui/button';
import { FlipCard } from './flip-card';
import { StudyModeOverlay } from './study-mode-overlay';

export function GlobalFlashcards({ cards }: { cards: GlobalFlashcard[] }) {
  const [search, setSearch] = useState('');
  const [isStudyMode, setIsStudyMode] = useState(false);

  const filteredCards = cards.filter(
    (c) =>
      c.term.toLowerCase().includes(search.toLowerCase()) ||
      c.definition.toLowerCase().includes(search.toLowerCase()) ||
      c.content.video.title?.toLowerCase().includes(search.toLowerCase()),
  );

  if (!cards.length) {
    return (
      <div className='flex flex-col items-center justify-center h-[500px] text-muted-foreground border-2 border-dashed rounded-2xl bg-muted/20 text-center p-6'>
        <BrainCircuit className='h-16 w-16 mb-4 text-primary/30' />
        <h3 className='text-xl font-bold text-foreground mb-2'>
          Здесь пока пусто
        </h3>
        <p className='max-w-md'>
          Ваша база знаний будет пополняться автоматически, как только вы
          начнете анализировать обучающие видео.
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-8'>
      {isStudyMode && (
        <StudyModeOverlay
          cards={filteredCards}
          onClose={() => setIsStudyMode(false)}
        />
      )}

      <div className='flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border shadow-sm'>
        <div className='relative w-full sm:max-w-md'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground' />
          <Input
            placeholder='Поиск по терминам или видео...'
            className='pl-10 bg-background h-12 text-base rounded-lg border-muted-foreground/20 focus-visible:ring-primary/30'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Button
          size='lg'
          className='w-full sm:w-auto font-bold rounded-xl shadow-md shadow-primary/20 transition-all hover:scale-105 active:scale-95'
          onClick={() => setIsStudyMode(true)}
          disabled={filteredCards.length === 0}
        >
          <Play className='h-5 w-5 mr-2' /> Изучить карточки (
          {filteredCards.length})
        </Button>
      </div>

      {filteredCards.length === 0 ? (
        <div className='text-center py-20 text-muted-foreground'>
          <Search className='h-10 w-10 mx-auto mb-3 opacity-20' />
          <p>По запросу «{search}» ничего не найдено.</p>
        </div>
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
