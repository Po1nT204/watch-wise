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
  ArrowRight,
  CheckCircle2,
  LibraryBig,
  PlayCircle,
  Target,
  Users,
  Zap,
} from 'lucide-react';
import { redirect } from 'next/navigation';
import { getVideosByUserId } from '@/services/video';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getUserDashboardStats } from '@/services/analytics';
import prisma from '@/config/prisma';

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const [allVideos, stats] = await Promise.all([
    getVideosByUserId(session.user.id),
    getUserDashboardStats(session.user.id),
  ]);

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { xp: true, level: true },
  });

  const recentVideos = allVideos.slice(0, 3);

  // Расчеты для прогресс-бара
  const currentXp = dbUser?.xp || 0;
  const currentLevel = dbUser?.level || 1;
  const xpForNextLevel = currentLevel * 100; // Простая формула: каждый новый уровень требует на 100 XP больше
  const xpInCurrentLevel = currentXp % 100;
  const progressPercentage = Math.round((xpInCurrentLevel / 100) * 100);

  return (
    <div className='flex flex-col gap-8 p-4 md:p-8'>
      {/* Заголовок и Геймификация */}
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-black tracking-tight'>Сводка</h1>
          <p className='text-muted-foreground mt-1'>
            Отслеживайте свои успехи и возвращайтесь к материалам.
          </p>
        </div>

        {/* Карточка текущего прогресса */}
        <Card className='w-full md:w-80 bg-gradient-to-br from-primary/10 to-transparent border-primary/20 shadow-none'>
          <CardContent className='p-4'>
            <div className='flex justify-between items-center mb-2'>
              <div className='flex items-center gap-2'>
                <div className='bg-primary text-primary-foreground w-8 h-8 rounded-md flex items-center justify-center font-bold'>
                  {currentLevel}
                </div>
                <span className='font-semibold text-sm'>Уровень</span>
              </div>
              <div className='text-sm font-bold text-primary flex items-center gap-1'>
                <Zap className='h-4 w-4 fill-primary' />
                {currentXp} XP
              </div>
            </div>

            <div className='h-2 w-full bg-muted rounded-full overflow-hidden'>
              <div
                className='h-full bg-primary transition-all duration-500 ease-out'
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <p className='text-[10px] text-muted-foreground text-right mt-1 font-medium'>
              {100 - xpInCurrentLevel} XP до уровня {currentLevel + 1}
            </p>
          </CardContent>
        </Card>
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
            <CardTitle className='text-sm font-medium'>
              Завершено тестов
            </CardTitle>
            <CheckCircle2 className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-bold'>{stats.totalTests}</div>
            <p className='text-xs text-muted-foreground mt-1'>
              Отвечено на {stats.totalQuestions} вопросов
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>
              Точность ответов
            </CardTitle>
            <Target className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-bold'>{stats.accuracy}%</div>
            <p className='text-xs text-muted-foreground mt-1'>
              Средний балл успеваемости
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>База знаний</CardTitle>
            <LibraryBig className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-bold'>{stats.flashcardsCount}</div>
            <p className='text-xs text-muted-foreground mt-1'>
              Терминов в карточках
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
