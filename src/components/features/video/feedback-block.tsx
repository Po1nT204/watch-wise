'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ThumbsUp, ThumbsDown, Loader2, Send } from 'lucide-react';
import { submitAiFeedback } from '@/server-actions/feedback';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface FeedbackBlockProps {
  generatedContentId: string;
}

export function FeedbackBlock({ generatedContentId }: FeedbackBlockProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedLike, setSelectedLike] = useState<boolean | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleLikeSelect = (liked: boolean) => {
    setSelectedLike(liked);
    if (liked) {
      sendFeedback(liked, '');
    }
  };

  const sendFeedback = (liked: boolean, textComment: string) => {
    startTransition(async () => {
      const result = await submitAiFeedback({
        generatedContentId,
        isLiked: liked,
        comment: textComment.trim() || null,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success);
        setIsSubmitted(true);
      }
    });
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedLike === null) return;
    sendFeedback(selectedLike, comment);
  };

  if (isSubmitted) {
    return (
      <div className='mt-6 p-4 bg-muted/40 rounded-xl border border-dashed text-center text-xs text-muted-foreground animate-in fade-in duration-300'>
        🎉 Отзыв отправлен. На основе вашего фидбека будет скорректирован
        системный промпт ИИ.
      </div>
    );
  }

  return (
    <div className='mt-8 pt-6 border-t border-border/60'>
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div>
          <h4 className='text-xs uppercase font-bold tracking-wider text-muted-foreground'>
            Оцените качество анализа ИИ
          </h4>
          <p className='text-xs text-muted-foreground/70 mt-0.5'>
            Помогите нам сделать конспекты и тесты точнее
          </p>
        </div>

        <div className='flex items-center gap-2'>
          <Button
            variant={selectedLike === true ? 'default' : 'outline'}
            size='sm'
            className='rounded-full h-8 px-4 font-semibold'
            disabled={isPending || selectedLike !== null}
            onClick={() => handleLikeSelect(true)}
          >
            <ThumbsUp className='h-3.5 w-3.5 mr-1.5' /> Полезно
          </Button>

          <Button
            variant={selectedLike === false ? 'destructive' : 'outline'}
            size='sm'
            className='rounded-full h-8 px-4 font-semibold'
            disabled={
              isPending || (selectedLike !== null && selectedLike !== false)
            }
            onClick={() => handleLikeSelect(false)}
          >
            <ThumbsDown className='h-3.5 w-3.5 mr-1.5' /> Есть ошибки
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {selectedLike === false && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.4, bounce: 0 }}
            onSubmit={handleSubmitComment}
            className='overflow-hidden'
          >
            <div className='pt-4 space-y-3'>
              <Textarea
                placeholder='Что именно нужно исправить? (Например: неправильный таймкод вопроса, галлюцинация в термине, неточный конспект...)'
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={1000}
                disabled={isPending}
                className='min-h-[80px] text-xs p-3 bg-background resize-none focus-visible:ring-primary/20'
                required
              />
              <div className='flex justify-end'>
                <Button
                  type='submit'
                  size='sm'
                  disabled={isPending || !comment.trim()}
                  className='rounded-xl font-bold h-8 text-xs px-4 shadow-sm'
                >
                  {isPending ? (
                    <Loader2 className='h-3.5 w-3.5 animate-spin mr-1.5' />
                  ) : (
                    <Send className='h-3.5 w-3.5 mr-1.5' />
                  )}
                  Отправить замечание
                </Button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
