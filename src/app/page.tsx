import Link from 'next/link';
import { Hero } from '@/components/features/landing/hero';
import { Features } from '@/components/features/landing/features';
import { Button } from '@/components/ui/button';
import { Video, ChevronRight } from 'lucide-react';
import { auth } from '@/config/auth';
import { FAQ } from '@/components/features/landing/faq';

export default async function Home() {
  const session = await auth();

  return (
    <div className='flex min-h-screen flex-col selection:bg-primary selection:text-white'>
      <header className='fixed top-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none'>
        <nav className='flex h-16 w-full max-w-5xl items-center justify-between rounded-full border border-border/40 bg-background/60 px-6 backdrop-blur-xl shadow-sm pointer-events-auto'>
          <Link
            href='/'
            className='flex items-center gap-2 font-black text-xl text-primary tracking-tighter hover:opacity-80 transition-opacity'
          >
            <div className='bg-primary text-white p-1.5 rounded-lg'>
              <Video className='h-5 w-5' />
            </div>
            WatchWise
          </Link>

          <div className='flex items-center gap-3'>
            {session ? (
              <Button className='rounded-full font-bold px-6 shadow-md' asChild>
                <Link href='/dashboard'>
                  Личный кабинет <ChevronRight className='ml-1 h-4 w-4' />
                </Link>
              </Button>
            ) : (
              <>
                <Button
                  variant='ghost'
                  className='font-semibold rounded-full hidden sm:flex'
                  asChild
                >
                  <Link href='/login'>Войти</Link>
                </Button>
                <Button
                  className='rounded-full font-bold px-6 shadow-md'
                  asChild
                >
                  <Link href='/register'>Начать</Link>
                </Button>
              </>
            )}
          </div>
        </nav>
      </header>

      <main className='flex-1'>
        <Hero />
        <Features />
        <FAQ />

        <section className='py-32 text-center container mx-auto px-4'>
          <div className='rounded-[40px] bg-foreground p-12 md:p-20 text-background shadow-2xl overflow-hidden relative max-w-5xl mx-auto'>
            <div className='absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-primary/30 rounded-full blur-[100px]' />
            <div className='absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[80px]' />

            <div className='relative z-10 flex flex-col items-center'>
              <h2 className='text-4xl md:text-6xl font-black mb-6 tracking-tight'>
                Готовы изменить свой <br /> подход к обучению?
              </h2>
              <p className='text-muted-foreground/80 mb-10 text-lg max-w-xl'>
                Присоединяйтесь к платформе и начните усваивать информацию из
                видео в 3 раза эффективнее уже сегодня.
              </p>
              <Button
                size='lg'
                className='rounded-full font-black px-12 h-16 text-lg bg-primary hover:bg-primary/90 text-white border-0 transition-transform hover:scale-105 shadow-xl shadow-primary/30'
                asChild
              >
                <Link href='/register'>Создать аккаунт бесплатно</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className='border-t border-border/40 py-12 text-center text-sm text-muted-foreground bg-muted/20'>
        <div className='flex items-center justify-center gap-2 font-bold text-foreground opacity-80 mb-2'>
          <Video className='h-4 w-4' /> WatchWise
        </div>
        <p>
          © {new Date().getFullYear()} Выпускная квалификационная работа (ВКР).
        </p>
      </footer>
    </div>
  );
}
