import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles, Play, ArrowRight } from 'lucide-react';

export function Hero() {
  return (
    <section className='relative overflow-hidden py-24 lg:py-32'>
      {/* Декоративный фон */}
      <div className='absolute inset-0 -z-10 bg-[radial-gradient(45%_45%_at_50%_50%,var(--color-primary)_0%,transparent_100%)] opacity-5' />

      <div className='container mx-auto px-4 text-center'>
        <div className='inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary mb-6 animate-in fade-in slide-in-from-top-4 duration-1000'>
          <Sparkles className='h-4 w-4' />
          <span>Образование на базе ИИ</span>
        </div>

        <h1 className='text-4xl font-black tracking-tight sm:text-6xl lg:text-7xl mb-6 text-foreground'>
          Учись эффективнее с <br />
          <span className='text-primary'>WatchWise</span>
        </h1>

        <p className='mx-auto max-w-2xl text-lg text-muted-foreground mb-10 leading-relaxed'>
          Превращаем пассивный просмотр видео в активный процесс обучения.
          Генерируйте конспекты, проходите тесты и закрепляйте материал с
          помощью нейросетей.
        </p>

        <div className='flex flex-col sm:flex-row items-center justify-center gap-4'>
          <Button
            size='lg'
            className='rounded-full px-8 h-12 text-base font-bold shadow-lg shadow-primary/20'
            asChild
          >
            <Link href='/register'>
              Начать бесплатно
              <ArrowRight className='ml-2 h-5 w-5' />
            </Link>
          </Button>
          <Button
            size='lg'
            variant='outline'
            className='rounded-full px-8 h-12 text-base font-semibold'
            asChild
          >
            <Link href='/login'>Войти в систему</Link>
          </Button>
        </div>

        {/* Плейсхолдер для скриншота продукта */}
        <div className='mt-16 relative mx-auto max-w-5xl rounded-2xl border bg-card p-2 shadow-2xl animate-in fade-in zoom-in duration-1000'>
          <div className='aspect-video rounded-xl bg-muted/50 flex items-center justify-center border border-dashed'>
            <div className='flex flex-col items-center gap-2 text-muted-foreground'>
              <Play className='h-12 w-12 opacity-20' />
              <span className='text-sm font-medium opacity-50 uppercase tracking-widest'>
                Интерфейс платформы
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
