'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { BrainCircuit, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlobalFlashcard } from '@/shared/types';

interface StudyModeOverlayProps {
  cards: GlobalFlashcard[];
  onClose: () => void;
}

export function StudyModeOverlay({ cards, onClose }: StudyModeOverlayProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleNext = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setIsFlipped(false);
      setTimeout(
        () => setCurrentIndex((prev) => (prev + 1) % cards.length),
        150,
      );
    },
    [cards.length],
  );

  const handlePrev = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setIsFlipped(false);
      setTimeout(
        () =>
          setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length),
        150,
      );
    },
    [cards.length],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      }
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, onClose]);

  const currentCard = cards[currentIndex];

  return (
    <div className='fixed inset-0 z-[100] flex flex-col bg-background/95 backdrop-blur-xl animate-in fade-in duration-300'>
      <div className='flex items-center justify-between p-6 border-b border-border/50'>
        <div className='flex items-center gap-4'>
          <Button
            variant='ghost'
            size='icon'
            onClick={onClose}
            className='rounded-full hover:bg-destructive/10 hover:text-destructive'
          >
            <X className='h-6 w-6' />
          </Button>
          <div className='font-bold text-lg hidden sm:block'>
            Режим фокусировки
          </div>
        </div>

        {/* Прогресс бар изучения */}
        <div className='flex items-center gap-4 flex-1 max-w-md mx-4'>
          <span className='text-sm font-bold text-muted-foreground w-12 text-right'>
            {currentIndex + 1} / {cards.length}
          </span>
          <div className='h-2 flex-1 bg-muted rounded-full overflow-hidden'>
            <motion.div
              className='h-full bg-primary'
              initial={{ width: 0 }}
              animate={{
                width: `${((currentIndex + 1) / cards.length) * 100}%`,
              }}
              transition={{ ease: 'easeInOut' }}
            />
          </div>
        </div>

        <div className='text-xs text-muted-foreground hidden md:block'>
          Используйте <kbd className='px-1.5 py-0.5 bg-muted rounded'>←</kbd>{' '}
          <kbd className='px-1.5 py-0.5 bg-muted rounded'>Space</kbd>{' '}
          <kbd className='px-1.5 py-0.5 bg-muted rounded'>→</kbd>
        </div>
      </div>

      <div className='flex-1 flex items-center justify-center p-4 relative'>
        <Button
          variant='ghost'
          size='icon'
          onClick={handlePrev}
          className='absolute left-4 md:left-12 h-16 w-16 rounded-full hidden sm:flex'
        >
          <ChevronLeft className='h-8 w-8 text-muted-foreground' />
        </Button>

        <AnimatePresence mode='wait'>
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className='w-full max-w-3xl aspect-[3/2] sm:aspect-[2/1] perspective-1000 cursor-pointer'
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div
              className={cn(
                'relative w-full h-full transition-transform duration-500 preserve-3d shadow-2xl rounded-3xl',
                isFlipped ? 'rotate-y-180' : '',
              )}
            >
              {/* Термин */}
              <Card className='absolute inset-0 backface-hidden flex flex-col items-center justify-center p-8 text-center border-4 border-primary/10 bg-card'>
                <BrainCircuit className='h-12 w-12 text-primary/20 mb-6' />
                <h2 className='text-4xl md:text-5xl font-black text-foreground'>
                  {currentCard.term}
                </h2>
                <p className='text-muted-foreground mt-8 text-sm opacity-60'>
                  Нажмите пробел или кликните, чтобы перевернуть
                </p>
              </Card>

              {/* Определение */}
              <Card className='absolute inset-0 backface-hidden rotate-y-180 flex items-center justify-center p-8 text-center bg-primary text-primary-foreground border-none'>
                <p className='text-2xl md:text-3xl font-medium leading-relaxed'>
                  {currentCard.definition}
                </p>
              </Card>
            </div>
          </motion.div>
        </AnimatePresence>

        <Button
          variant='ghost'
          size='icon'
          onClick={handleNext}
          className='absolute right-4 md:right-12 h-16 w-16 rounded-full hidden sm:flex'
        >
          <ChevronRight className='h-8 w-8 text-muted-foreground' />
        </Button>
      </div>

      <div className='sm:hidden flex justify-center gap-8 p-6 pb-12'>
        <Button
          variant='outline'
          size='icon'
          onClick={handlePrev}
          className='h-14 w-14 rounded-full shadow-md'
        >
          <ChevronLeft className='h-6 w-6' />
        </Button>
        <Button
          variant='outline'
          size='icon'
          onClick={handleNext}
          className='h-14 w-14 rounded-full shadow-md'
        >
          <ChevronRight className='h-6 w-6' />
        </Button>
      </div>
    </div>
  );
}
