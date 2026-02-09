'use client';

import { useTransition } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { deleteVideo } from '@/server-actions/video';

export function DeleteVideoButton({ videoId }: { videoId: string }) {
  const [isPending, startTransition] = useTransition();

  const onDelete = (e: React.MouseEvent) => {
    e.preventDefault(); // Чтобы не сработал переход по ссылке, если кнопка внутри Link

    if (
      confirm(
        'Вы уверены, что хотите удалить это видео и все результаты тестов?',
      )
    ) {
      startTransition(async () => {
        await deleteVideo(videoId);
      });
    }
  };

  return (
    <Button
      variant='ghost'
      size='icon'
      disabled={isPending}
      onClick={onDelete}
      className='opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10 transition-all'
    >
      {isPending ? (
        <Loader2 className='h-4 w-4 animate-spin' />
      ) : (
        <Trash2 className='h-4 w-4' />
      )}
    </Button>
  );
}
