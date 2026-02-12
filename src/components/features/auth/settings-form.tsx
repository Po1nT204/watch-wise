'use client';

import { useTransition } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { updateUserSettings } from '@/server-actions/user';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
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
    <form action={handleSubmit}>
      <Card className='border-none shadow-none bg-transparent'>
        <CardContent className='p-0 space-y-6'>
          <div className='flex flex-col md:flex-row gap-8 items-start'>
            <div className='flex flex-col gap-4 items-center'>
              <div className='h-32 w-32 rounded-full border-4 border-primary/10 overflow-hidden bg-muted flex items-center justify-center relative'>
                {user.image ? (
                  <Image
                    src={user.image}
                    alt='Avatar'
                    fill
                    className='object-cover'
                  />
                ) : (
                  <span className='text-4xl font-bold text-muted-foreground'>
                    {user.name?.[0]}
                  </span>
                )}
              </div>
              <Button variant='outline' size='sm' type='button' disabled>
                Изменить фото
              </Button>
            </div>

            <div className='flex-1 w-full space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='name'>Имя</Label>
                  <Input
                    id='name'
                    name='name'
                    defaultValue={user.name || ''}
                    disabled={isPending}
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='age'>Возраст</Label>
                  <Input
                    id='age'
                    name='age'
                    type='number'
                    defaultValue={user.age || ''}
                    disabled={isPending}
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='bio'>О себе</Label>
                <Textarea
                  id='bio'
                  name='bio'
                  defaultValue={user.bio || ''}
                  placeholder='Расскажите о ваших интересах в обучении...'
                  className='min-h-[120px] resize-none'
                  disabled={isPending}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='location'>Местоположение</Label>
                <Input
                  id='location'
                  name='location'
                  defaultValue={user.location || ''}
                  placeholder='Город, ВУЗ...'
                  disabled={isPending}
                />
              </div>

              <Button
                type='submit'
                className='font-bold px-8'
                disabled={isPending}
              >
                {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                Сохранить всё
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
