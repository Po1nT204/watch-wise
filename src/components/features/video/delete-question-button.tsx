'use client';

import { useTransition } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { deleteQuizQuestion } from '@/server-actions/quiz';
import { toast } from 'sonner';

interface DeleteQuestionButtonProps {
  questionId: string;
  videoId: string;
}

export function DeleteQuestionButton({
  questionId,
  videoId,
}: DeleteQuestionButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm('Вы уверены, что хотите удалить этот вопрос?')) {
      startTransition(async () => {
        const result = await deleteQuizQuestion(questionId, videoId);
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success('Вопрос удален');
        }
      });
    }
  };

  return (
    <Button
      variant='ghost'
      size='icon'
      className='h-8 w-8 text-destructive hover:bg-destructive/10 transition-colors'
      onClick={handleDelete}
      disabled={isPending}
      title='Удалить вопрос'
    >
      {isPending ? (
        <Loader2 className='h-4 w-4 animate-spin' />
      ) : (
        <Trash2 className='h-4 w-4' />
      )}
    </Button>
  );
}
