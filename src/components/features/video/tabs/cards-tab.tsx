import { ScrollArea } from '@/components/ui/scroll-area';
import { LibraryBig } from 'lucide-react';
import { Flashcards } from '../flashcards';
import { Flashcard } from '@/shared/types';

interface CardsTabProps {
  flashcards: Flashcard[];
  activeCardIndex: number;
}

export function CardsTab({ flashcards, activeCardIndex }: CardsTabProps) {
  if (flashcards.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center h-full min-h-[300px] text-muted-foreground border border-dashed rounded-md text-center p-6'>
        <LibraryBig className='h-8 w-8 mb-2 opacity-20' />
        <p className='text-sm'>Карточки появятся после анализа видео</p>
      </div>
    );
  }

  return (
    <ScrollArea className='flex-1 px-4 min-h-0'>
      <div className='pb-6'>
        <Flashcards cards={flashcards} activeIndex={activeCardIndex} />
      </div>
    </ScrollArea>
  );
}
