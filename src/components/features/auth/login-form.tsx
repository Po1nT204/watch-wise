'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { LoginSchema } from '@/shared/schemas';
import { loginUser } from '@/server-actions/auth';

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

export const LoginForm = () => {
  const [error, setError] = useState<string | undefined>('');
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    setError('');

    startTransition(() => {
      loginUser(values).then((data) => {
        // Если вернулся объект с ошибкой (редирект в auth.ts выбрасывает исключение, которое не попадает сюда в success кейс)
        if (data?.error) {
          setError(data.error);
        }
      });
    });
  };

  return (
    <Card className='w-[400px] shadow-md'>
      <CardHeader>
        <CardTitle className='text-center text-2xl'>Вход</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <div className='space-y-4'>
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
            <Button type='submit' className='w-full' disabled={isPending}>
              Войти
            </Button>
          </form>
        </Form>
        <div className='mt-4 text-center text-sm'>
          <Link href='/register' className='underline'>
            Нет аккаунта? Регистрация
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
