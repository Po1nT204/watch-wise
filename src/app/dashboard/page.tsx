import { auth } from '@/config/auth';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Activity,
  Link,
  PlayCircle,
  PlusCircle,
  Users,
  VideoIcon,
} from 'lucide-react';
import { redirect } from 'next/navigation';
import { getVideosByUserId } from '@/services/video';
import { Button } from '@/components/ui/button';

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  const videos = await getVideosByUserId(session.user.id);

  return (
    <div className='flex flex-col gap-4 p-4 md:gap-8 md:p-8'>
      <div className='flex items-center justify-between'>
        <h1 className='text-lg font-semibold md:text-2xl'>Личный кабинет</h1>

        {/* Кнопка добавления (пока не работает, но уже есть в UI) */}
        <Button>
          <PlusCircle className='mr-2 h-4 w-4' />
          Добавить видео
        </Button>
      </div>

      {/* --- БЛОК СТАТИСТИКИ --- */}
      <div className='grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Всего видео</CardTitle>
            <Activity className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            {/* Вставляем реальное количество */}
            <div className='text-2xl font-bold'>{videos.length}</div>
            <p className='text-xs text-muted-foreground'>
              Загружено в библиотеку
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Пройдено тестов
            </CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            {/* Пока оставляем 0, это отдельная логика */}
            <div className='text-2xl font-bold'>0</div>
            <p className='text-xs text-muted-foreground'>Средний балл: 0%</p>
          </CardContent>
        </Card>

        {/* Можно добавить еще карточки (часы просмотра и т.д.) */}
      </div>

      {/* --- БЛОК СПИСКА ВИДЕО --- */}
      <div className='grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3'>
        <Card className='xl:col-span-2'>
          <CardHeader className='flex flex-row items-center'>
            <div className='grid gap-2'>
              <CardTitle>Недавние видео</CardTitle>
              <CardDescription>Ваша история обучения.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {videos.length === 0 ? (
              // --- ТВОЙ EMPTY STATE (Адаптированный) ---
              <div className='flex flex-col min-h-[300px] items-center justify-center rounded-md border border-dashed text-center animate-in fade-in-50'>
                <div className='flex h-20 w-20 items-center justify-center rounded-full bg-muted'>
                  <VideoIcon className='h-10 w-10 text-muted-foreground' />
                </div>
                <h3 className='mt-4 text-lg font-semibold'>Библиотека пуста</h3>
                <p className='mb-4 mt-2 text-sm text-muted-foreground max-w-sm mx-auto'>
                  Вы еще не добавили ни одного видео. Нажмите кнопку `Добавить
                  видео` сверху, чтобы начать.
                </p>
              </div>
            ) : (
              // --- СПИСОК ВИДЕО (Реальные данные) ---
              <div className='space-y-8'>
                {videos.map((video) => (
                  <div key={video.id} className='flex items-center'>
                    <div className='h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center mr-4'>
                      <PlayCircle className='h-5 w-5 text-blue-600' />
                    </div>
                    <div className='ml-4 space-y-1'>
                      <p className='text-sm font-medium leading-none'>
                        {video.title || 'Видео без названия'}
                      </p>
                      <p className='text-sm text-muted-foreground'>
                        {video.platform} •{' '}
                        {new Date(video.createdAt).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                    <div className='ml-auto font-medium'>
                      {/* Сюда можно вывести статус или кнопку "Перейти" */}
                      <Button variant='ghost' size='sm' asChild>
                        <Link href={`/dashboard/video/${video.id}`}>
                          Открыть
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
    </div>
  );
}
