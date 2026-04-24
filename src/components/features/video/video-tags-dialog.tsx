'use client';

import { useState, useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toggleVideoTag, createTag, deleteTag } from '@/server-actions/tags';
import { Loader2, Plus, Tags, X } from 'lucide-react';
import { toast } from 'sonner';
import { Tag } from '@/shared/types';

interface VideoTagsDialogProps {
  videoId: string;

  currentTags: Tag[];

  allTags: Tag[];
}

export function VideoTagsDialog({
  videoId,
  currentTags,
  allTags,
}: VideoTagsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [isPending, startTransition] = useTransition();

  const currentTagIds = currentTags.map((t) => t.id);

  const handleToggle = (tagId: string, isCurrentlyAttached: boolean) => {
    startTransition(async () => {
      const result = await toggleVideoTag(videoId, tagId, !isCurrentlyAttached);
      if (result.error) toast.error(result.error);
    });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    startTransition(async () => {
      const result = await createTag(newTagName);
      if (result.error) {
        toast.error(result.error);
      } else if (result.tag) {
        // Сразу привязываем только что созданный тег к этому видео
        await toggleVideoTag(videoId, result.tag.id, true);
        setNewTagName('');
        toast.success('Тег создан и привязан');
      }
    });
  };

  const handleDeleteGlobalTag = (tagId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Удалить этот тег навсегда из всех видео?')) {
      startTransition(async () => {
        const result = await deleteTag(tagId);
        if (result.error) toast.error(result.error);
        else toast.success('Тег удален');
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant='ghost'
          size='sm'
          className='h-8 text-xs text-muted-foreground hover:text-primary'
        >
          <Tags className='mr-2 h-3.5 w-3.5' />
          Теги ({currentTags.length})
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Управление тегами видео</DialogTitle>
        </DialogHeader>

        <div className='py-4 space-y-6'>
          {/* Форма создания нового тега */}
          <form onSubmit={handleCreate} className='flex items-center gap-2'>
            <Input
              placeholder="Новый тег (напр. 'Физика'). Некоторые теги появятся автоматически после анализа видео ИИ"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              disabled={isPending}
              className='h-9'
            />
            <Button
              type='submit'
              size='sm'
              disabled={isPending || !newTagName.trim()}
              className='h-9'
            >
              {isPending ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                <Plus className='h-4 w-4' />
              )}
            </Button>
          </form>

          {/* Список всех тегов пользователя */}
          <div className='space-y-3'>
            <p className='text-sm font-medium text-muted-foreground'>
              Ваши теги (нажмите для привязки):
            </p>
            {allTags.length === 0 ? (
              <p className='text-xs text-muted-foreground italic'>
                У вас еще нет тегов.
              </p>
            ) : (
              <div className='flex flex-wrap gap-2'>
                {allTags.map((tag) => {
                  const isAttached = currentTagIds.includes(tag.id);
                  return (
                    <Badge
                      key={tag.id}
                      variant={isAttached ? 'default' : 'outline'}
                      className={`cursor-pointer transition-all pr-1.5 ${isAttached ? 'hover:bg-primary/80' : 'hover:bg-muted'}`}
                      onClick={() => handleToggle(tag.id, isAttached)}
                    >
                      {tag.name}
                      <span
                        className='ml-1 p-0.5 rounded-full hover:bg-destructive hover:text-white transition-colors'
                        onClick={(e) => handleDeleteGlobalTag(tag.id, e)}
                        title='Удалить тег глобально'
                      >
                        <X className='h-3 w-3 opacity-50 hover:opacity-100' />
                      </span>
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
