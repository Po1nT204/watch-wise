'use client';

import { useTransition } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { updateUserSettings } from '@/server-actions/user';
import { toast } from 'sonner';
import { Loader2, Camera, Save } from 'lucide-react';
import { User } from '@prisma/client';

export function SettingsForm({ user }: { user: User }) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (formData: FormData) => {
    const linksData: Record<string, string> = {};
    const websiteValue = formData.get('links') as string;
    if (websiteValue) {
      linksData.website = websiteValue;
    }

    const values = {
      name: formData.get('name') as string,
      age: formData.get('age') ? Number(formData.get('age')) : null,
      bio: formData.get('bio') as string,
      location: formData.get('location') as string,
      links: linksData,
    };

    startTransition(async () => {
      const result = await updateUserSettings(values);
      if (result.success) {
        toast.success(result.success);
      } else if (result.error) {
        toast.error(result.error);
      }
    });
  };

  return (
    <form action={handleSubmit} className='pb-10'>
      <Card className='border border-border/50 shadow-lg bg-card/50 backdrop-blur overflow-hidden'>
        <CardContent className='p-6 md:p-8 space-y-8'>
          <div className='flex flex-col md:flex-row gap-8 items-center md:items-start pb-8 border-b border-border/50'>
            <div className='flex flex-col gap-4 items-center group relative'>
              <div className='h-32 w-32 rounded-full border-4 border-background shadow-xl overflow-hidden bg-muted flex items-center justify-center relative transition-transform duration-300 group-hover:scale-105'>
                {user.image ? (
                  <img
                    src={user.image}
                    alt='Avatar'
                    className='object-cover w-full h-full'
                  />
                ) : (
                  <span className='text-5xl font-black text-muted-foreground/30'>
                    {user.name?.[0] || 'U'}
                  </span>
                )}
                <div className='absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer'>
                  <Camera className='text-white h-8 w-8' />
                </div>
              </div>
              <div className='absolute -inset-4 bg-primary/20 blur-2xl rounded-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500' />
            </div>

            <div className='flex-1 space-y-2 text-center md:text-left mt-4 md:mt-0'>
              <h3 className='text-xl font-bold'>
                {user.name || 'Пользователь'}
              </h3>
              <p className='text-sm text-muted-foreground'>{user.email}</p>
              <div className='pt-2'>
                <Button
                  variant='outline'
                  size='sm'
                  type='button'
                  disabled
                  className='rounded-full'
                >
                  Сменить аватар
                </Button>
              </div>
            </div>
          </div>

          <div className='w-full space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-2'>
                <Label
                  htmlFor='name'
                  className='text-xs uppercase font-bold text-muted-foreground tracking-wider'
                >
                  Отображаемое имя
                </Label>
                <Input
                  id='name'
                  name='name'
                  defaultValue={user.name || ''}
                  disabled={isPending}
                  className='bg-background h-12'
                />
              </div>
              <div className='space-y-2'>
                <Label
                  htmlFor='age'
                  className='text-xs uppercase font-bold text-muted-foreground tracking-wider'
                >
                  Возраст
                </Label>
                <Input
                  id='age'
                  name='age'
                  type='number'
                  defaultValue={user.age || ''}
                  disabled={isPending}
                  className='bg-background h-12'
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label
                htmlFor='location'
                className='text-xs uppercase font-bold text-muted-foreground tracking-wider'
              >
                Локация / ВУЗ
              </Label>
              <Input
                id='location'
                name='location'
                defaultValue={user.location || ''}
                placeholder='Например: Екатеринбург, УрФУ'
                disabled={isPending}
                className='bg-background h-12'
              />
            </div>

            <div className='space-y-2'>
              <Label
                htmlFor='bio'
                className='text-xs uppercase font-bold text-muted-foreground tracking-wider'
              >
                О себе
              </Label>
              <Textarea
                id='bio'
                name='bio'
                defaultValue={user.bio || ''}
                placeholder='Расскажите о ваших интересах в обучении...'
                className='min-h-[120px] resize-none bg-background p-4'
                disabled={isPending}
              />
            </div>
          </div>
        </CardContent>

        <div className='bg-muted/30 px-6 md:px-8 py-4 border-t border-border/50 flex justify-end'>
          <Button
            type='submit'
            size='lg'
            className='font-bold rounded-xl px-8 shadow-md shadow-primary/20 transition-transform active:scale-95'
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className='mr-2 h-5 w-5 animate-spin' />
            ) : (
              <Save className='mr-2 h-5 w-5' />
            )}
            {isPending ? 'Сохранение...' : 'Сохранить изменения'}
          </Button>
        </div>
      </Card>
    </form>
  );
}
