import { auth } from '@/config/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return (
    <div className='flex flex-col gap-6 p-4 md:p-8 max-w-4xl mx-auto'>
      <div className='flex flex-col gap-2'>
        <h1 className='text-3xl font-bold tracking-tight text-primary'>
          Профиль
        </h1>
        <p className='text-muted-foreground'>
          Персонализируйте ваш аккаунт в WatchWise.
        </p>
      </div>

      <Separator />

      <div className='grid gap-8'>
        <Card className='border-none shadow-none bg-transparent'>
          <CardContent className='p-0 space-y-6'>
            <div className='flex flex-col md:flex-row gap-8 items-start'>
              {/* Аватар */}
              <div className='flex flex-col gap-4 items-center'>
                <div className='h-32 w-32 rounded-full border-4 border-primary/10 overflow-hidden bg-muted flex items-center justify-center'>
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt='Avatar'
                      className='h-full w-full object-cover'
                    />
                  ) : (
                    <span className='text-4xl font-bold text-muted-foreground'>
                      {session.user.name?.[0]}
                    </span>
                  )}
                </div>
                <Button variant='outline' size='sm'>
                  Изменить фото
                </Button>
              </div>

              {/* Поля */}
              <div className='flex-1 w-full space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label>Имя</Label>
                    <Input defaultValue={session.user.name || ''} />
                  </div>
                  <div className='space-y-2'>
                    <Label>Возраст</Label>
                    <Input type='number' placeholder='Например: 21' />
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label>О себе</Label>
                  <Textarea
                    placeholder='Расскажите о ваших интересах в обучении...'
                    className='min-h-[120px] resize-none'
                  />
                </div>

                <div className='space-y-2'>
                  <Label>Ссылки (LinkedIn, GitHub, Portfolio)</Label>
                  <Input placeholder='https://...' />
                </div>

                <Button className='font-bold px-8'>Сохранить всё</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
