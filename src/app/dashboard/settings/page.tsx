import { auth } from '@/config/auth';
import { redirect } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return (
    <div className='flex flex-col gap-6 p-4 md:p-8 max-w-4xl'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>Настройки</h1>
        <p className='text-muted-foreground'>
          Управляйте своим профилем и предпочтениями обучения.
        </p>
      </div>
      <Separator />

      <div className='grid gap-6'>
        {/* Секция профиля */}
        <Card>
          <CardHeader>
            <CardTitle>Личные данные</CardTitle>
            <CardDescription>Информация о вашем аккаунте.</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid gap-2'>
              <Label htmlFor='name'>Имя</Label>
              <Input id='name' defaultValue={session.user.name || ''} />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                defaultValue={session.user.email || ''}
                disabled
              />
              <p className='text-[11px] text-muted-foreground italic'>
                Email нельзя изменить, так как он привязан к вашей авторизации.
              </p>
            </div>
            <Button className='w-fit'>Сохранить изменения</Button>
          </CardContent>
        </Card>

        {/* Секция предпочтений ИИ */}
        <Card className='border-primary/20 bg-primary/5'>
          <CardHeader>
            <CardTitle className='text-primary'>
              Параметры обучения (AI)
            </CardTitle>
            <CardDescription>
              Эти настройки будут использоваться при генерации конспектов и
              тестов.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            {/* Сюда мы позже добавим Select для сложности и режима */}
            <div className='p-4 border border-dashed rounded-lg flex items-center justify-center text-sm text-muted-foreground italic'>
              Селекторы сложности и ролей будут добавлены в следующем шаге
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
