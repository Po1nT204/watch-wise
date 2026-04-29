'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { RegisterSchema } from '@/shared/schemas';
import { registerUser } from '@/server-actions/auth';
import { signIn } from 'next-auth/react';
import { GithubIcon, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export const RegisterForm = () => {
  const [error, setError] = useState<string | undefined>('');
  const [success, setSuccess] = useState<string | undefined>('');
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
    },
  });

  const onSubmit = (values: z.infer<typeof RegisterSchema>) => {
    setError('');
    setSuccess('');

    startTransition(() => {
      registerUser(values).then((data) => {
        setError(data.error);
        setSuccess(data.success);
      });
    });
  };

  return (
    <Card className='w-[400px] shadow-md'>
      <CardHeader>
        <CardTitle className='text-center text-2xl'>Регистрация</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <div className='space-y-4'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Имя</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder='Иван Иванов'
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder='ivan@example.com'
                        type='email'
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Пароль</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder='******'
                        type='password'
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {error && (
              <div className='p-3 bg-destructive/15 text-destructive rounded-md text-sm'>
                {error}
              </div>
            )}
            {success && (
              <div className='p-3 bg-emerald-500/15 text-emerald-500 rounded-md text-sm'>
                {success}
              </div>
            )}
            <Button type='submit' className='w-full' disabled={isPending}>
              {isPending ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                'Создать аккаунт'
              )}
            </Button>
          </form>
        </Form>
        <div className='mt-4 text-center text-sm'>
          <Link href='/login' className='underline'>
            Уже есть аккаунт? Войти
          </Link>
        </div>
        <div className='relative my-4'>
          <div className='absolute inset-0 flex items-center'>
            <span className='w-full border-t' />
          </div>
          <div className='relative flex justify-center text-xs uppercase'>
            <span className='bg-background px-2 text-muted-foreground'>
              Или регистрация через
            </span>
          </div>
        </div>

        <Button
          variant='outline'
          type='button'
          className='w-full font-semibold'
          onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
        >
          <GithubIcon className='mr-2 h-4 w-4' />
          GitHub
        </Button>
      </CardContent>
    </Card>
  );
};
