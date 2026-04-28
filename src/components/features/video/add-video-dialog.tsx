'use client';

import { useState, useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { addVideo } from '@/server-actions/video'; // Твой экшн
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AddVideoDialogProps {
  children: React.ReactNode;
}

export function AddVideoDialog({ children }: AddVideoDialogProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (formData: FormData) => {
    setError(null);
    const url = formData.get('url') as string;

    startTransition(async () => {
      const result = await addVideo({ url });

      if (result.error) {
        setError(result.error);
        toast.error(result.error);
      } else {
        toast.success('Видео успешно добавлено!');
        setOpen(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Добавить видео</DialogTitle>
          <DialogDescription>
            Вставьте ссылку на YouTube видео. Мы автоматически загрузим
            информацию о нем.
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit}>
          <div className='grid gap-4 py-4'>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='url' className='text-right'>
                URL
              </Label>
              <Input
                id='url'
                name='url'
                placeholder='https://youtube.com/...'
                className='col-span-3'
                required
                disabled={isPending}
              />
            </div>
            {error && (
              <div className='text-sm text-red-500 text-center'>{error}</div>
            )}
          </div>
          <DialogFooter>
            <Button type='submit' disabled={isPending}>
              {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              {isPending ? 'Анализ...' : 'Добавить'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
