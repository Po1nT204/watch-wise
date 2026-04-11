import { auth } from '@/config/auth';
import { redirect } from 'next/navigation';
import { getVideosByUserId } from '@/services/video';
import { getUserTags } from '@/server-actions/tags';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddVideoDialog } from '@/components/features/video/add-video-dialog';
import { VideosListClient } from '@/components/features/video/videos-list-client';

export default async function VideosLibraryPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  // Загружаем видео и глобальные теги пользователя параллельно
  const [videos, tagsResponse] = await Promise.all([
    getVideosByUserId(session.user.id),
    getUserTags(),
  ]);

  const allTags = tagsResponse.tags || [];

  return (
    <div className='flex flex-col gap-6 p-4 md:p-8 max-w-6xl mx-auto w-full'>
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-black tracking-tight'>Моя библиотека</h1>
          <p className='text-muted-foreground mt-1'>
            Управление материалами, фильтрация и категоризация по тегам.
          </p>
        </div>
        <AddVideoDialog>
          <Button
            size='lg'
            className='rounded-full shadow-lg shadow-primary/20 font-bold'
          >
            <PlusCircle className='mr-2 h-5 w-5' />
            Добавить видео
          </Button>
        </AddVideoDialog>
      </div>

      {/* Передаем данные в клиентский компонент для реактивной фильтрации */}
      <VideosListClient videos={videos} allTags={allTags} />
    </div>
  );
}
