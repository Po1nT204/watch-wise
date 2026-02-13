import { auth } from '@/config/auth';
import { redirect } from 'next/navigation';
import { getVideosByUserId } from '@/services/video';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { PlayCircle, VideoIcon, PlusCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddVideoDialog } from '@/components/features/video/add-video-dialog';
import { DeleteVideoButton } from '@/components/features/video/delete-video-button';
import Link from 'next/link';

export default async function VideosLibraryPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const videos = await getVideosByUserId(session.user.id);

  return (
    <div className='flex flex-col gap-6 p-4 md:p-8'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Моя библиотека</h1>
          <p className='text-muted-foreground'>
            Управление всеми вашими учебными материалами.
          </p>
        </div>
        <AddVideoDialog>
          <Button className='rounded-full shadow-lg shadow-primary/20'>
            <PlusCircle className='mr-2 h-4 w-4' />
            Добавить видео
          </Button>
        </AddVideoDialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Все видео</CardTitle>
          <CardDescription>
            Список видео, доступных для обучения.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {videos.length === 0 ? (
            <div className='flex flex-col min-h-[300px] items-center justify-center rounded-md border border-dashed text-center'>
              <VideoIcon className='h-10 w-10 text-muted-foreground opacity-20' />
              <h3 className='mt-4 text-lg font-semibold'>
                В библиотеке пока пусто
              </h3>
              <p className='mb-4 mt-2 text-sm text-muted-foreground'>
                Добавьте первое видео, чтобы начать анализ.
              </p>
            </div>
          ) : (
            <div className='grid gap-4'>
              {videos.map((video) => (
                <div
                  key={video.id}
                  className='group relative flex items-center p-4 rounded-xl border bg-card hover:shadow-md hover:border-primary/30 transition-all'
                >
                  <div className='h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mr-4'>
                    <PlayCircle className='h-7 w-7 text-primary' />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-bold truncate pr-8'>
                      {video.title || 'Без названия'}
                    </p>
                    <div className='flex items-center gap-3 mt-1'>
                      <span className='uppercase text-[10px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded'>
                        {video.platform}
                      </span>
                      <span className='text-[11px] text-muted-foreground'>
                        {new Date(video.createdAt).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <DeleteVideoButton videoId={video.id} />
                    <Button
                      size='sm'
                      className='rounded-full font-semibold'
                      asChild
                    >
                      <Link href={`/dashboard/video/${video.id}`}>
                        Открыть <ExternalLink className='ml-2 h-3.5 w-3.5' />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
