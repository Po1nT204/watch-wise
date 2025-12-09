import { auth } from '@/config/auth';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Activity, CreditCard, Users } from 'lucide-react';

export default async function DashboardPage() {
  const session = await auth();

  return (
    <>
      <div className='flex items-center'>
        <h1 className='text-lg font-semibold md:text-2xl'>Личный кабинет</h1>
      </div>

      <div className='grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Всего видео</CardTitle>
            <Activity className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>0</div>
            <p className='text-xs text-muted-foreground'>
              +0 за последний месяц
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
            <div className='text-2xl font-bold'>0</div>
            <p className='text-xs text-muted-foreground'>Средний балл: 0%</p>
          </CardContent>
        </Card>
      </div>

      <div className='grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3'>
        <Card className='xl:col-span-2'>
          <CardHeader>
            <CardTitle>Недавние видео</CardTitle>
            <CardDescription>Ваша история обучения.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='flex h-[200px] items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground'>
              Вы еще не добавили ни одного видео.
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
