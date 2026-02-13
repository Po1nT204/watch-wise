import { auth } from '@/config/auth';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Activity, ArrowRight, PlayCircle, Users } from 'lucide-react';
import { redirect } from 'next/navigation';
import { getVideosByUserId } from '@/services/video';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const allVideos = await getVideosByUserId(session.user.id);
  const recentVideos = allVideos.slice(0, 3); // Только последние 3

  return (
    <div className='flex flex-col gap-8 p-4 md:p-8'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-black tracking-tight'>Сводка</h1>
      </div>

      {/* --- БЛОК СТАТИСТИКИ --- */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card className='bg-primary text-primary-foreground'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>Библиотека</CardTitle>
            <Activity className='h-4 w-4 opacity-70' />
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-black'>{allVideos.length}</div>
            <p className='text-xs opacity-70 mt-1'>Видео загружено</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>Тесты</CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-bold'>0</div>
            <p className='text-xs text-muted-foreground mt-1'>
              Пройдено успешно
            </p>
          </CardContent>
        </Card>
      </div>

      {/* --- ПОСЛЕДНИЕ ВИДЕО --- */}
      <div className='grid gap-4 md:gap-8'>
        <Card className='border-none shadow-none bg-transparent'>
          <CardHeader className='px-0 flex flex-row items-center justify-between'>
            <div>
              <CardTitle>Недавние материалы</CardTitle>
              <CardDescription>
                Продолжите обучение с того места, где остановились.
              </CardDescription>
            </div>
            <Button variant='ghost' className='text-primary font-bold' asChild>
              <Link href='/dashboard/videos'>
                Смотреть все <ArrowRight className='ml-2 h-4 w-4' />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className='px-0'>
            <div className='grid gap-4 md:grid-cols-3'>
              {recentVideos.map((video) => (
                <Link
                  key={video.id}
                  href={`/dashboard/video/${video.id}`}
                  className='group block'
                >
                  <Card className='hover:border-primary transition-colors overflow-hidden'>
                    <div className='aspect-video bg-muted relative flex items-center justify-center'>
                      <PlayCircle className='h-10 w-10 text-muted-foreground group-hover:text-primary transition-colors' />
                    </div>
                    <CardHeader className='p-4'>
                      <CardTitle className='text-sm truncate'>
                        {video.title || 'Без названия'}
                      </CardTitle>
                      <CardDescription className='text-[10px] uppercase font-bold text-primary/60'>
                        {video.platform} •{' '}
                        {new Date(video.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
