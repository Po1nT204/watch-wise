import Link from 'next/link';
import { Hero } from '@/components/features/landing/hero';
import { Features } from '@/components/features/landing/features';
import { Button } from '@/components/ui/button';
import { Video } from 'lucide-react';
import { auth } from '@/config/auth';

export default async function Home() {
  const session = await auth();

  return (
    <div className='flex min-h-screen flex-col'>
      {/* Header */}
      <nav className='sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md'>
        <div className='container mx-auto flex h-16 items-center justify-between px-4'>
          <Link
            href='/'
            className='flex items-center gap-2 font-black text-xl text-primary tracking-tighter'
          >
            <Video className='h-6 w-6 fill-current' />
            WatchWise
          </Link>

          <div className='flex items-center gap-4'>
            {session ? (
              <Button
                variant='default'
                className='rounded-full font-bold'
                asChild
              >
                <Link href='/dashboard'>Личный кабинет</Link>
              </Button>
            ) : (
              <>
                <Button variant='ghost' className='font-semibold' asChild>
                  <Link href='/login'>Войти</Link>
                </Button>
                <Button className='rounded-full font-bold' asChild>
                  <Link href='/register'>Начать</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className='flex-1'>
        <Hero />
        <Features />

        {/* Footer-подобная секция CTA */}
        <section className='py-20 text-center container mx-auto px-4'>
          <div className='rounded-3xl bg-primary p-12 text-primary-foreground shadow-2xl shadow-primary/40 overflow-hidden relative'>
            <div className='absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl' />
            <h2 className='text-3xl font-black mb-6'>
              Готовы изменить свой подход к обучению?
            </h2>
            <Button
              size='lg'
              variant='secondary'
              className='rounded-full font-black text-primary px-10 h-14 text-lg'
              asChild
            >
              <Link href='/register'>Попробовать сейчас</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className='border-t py-12 text-center text-sm text-muted-foreground'>
        <p>© {new Date().getFullYear()} WatchWise. Проект для ВКР.</p>
      </footer>
    </div>
  );
}
