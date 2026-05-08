'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export function Hero() {
  return (
    <section className='relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-28'>
      <div className='absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-20 pointer-events-none'>
        <div className='absolute inset-0 bg-gradient-to-r from-primary/40 to-blue-500/40 blur-[100px] rounded-full mix-blend-multiply' />
      </div>

      <div className='container mx-auto px-4 text-center relative z-10'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-bold text-primary mb-8 border border-primary/20 shadow-sm'
        >
          <Sparkles className='h-4 w-4' />
          <span>Нейросети на страже ваших знаний</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className='text-5xl font-black tracking-tight sm:text-7xl lg:text-8xl mb-8 text-foreground'
        >
          Обучение, которое <br className='hidden sm:block' />
          <span className='text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600'>
            невозможно проспать
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className='mx-auto max-w-2xl text-lg sm:text-xl text-muted-foreground mb-12 leading-relaxed'
        >
          WatchWise превращает пассивный просмотр видеолекций в интерактивный
          тренажер. ИИ сам создаст конспекты, карточки и остановит видео, чтобы
          проверить ваши знания.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className='flex flex-col sm:flex-row items-center justify-center gap-4'
        >
          <Button
            size='lg'
            className='rounded-full px-8 h-14 text-base font-bold shadow-xl shadow-primary/25 transition-transform hover:scale-105'
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
            className='rounded-full px-8 h-14 text-base font-bold bg-background/50 backdrop-blur-sm transition-transform hover:scale-105'
            asChild
          >
            <Link href='/dashboard'>Посмотреть демо</Link>
          </Button>
        </motion.div>

        {/* Браузерный Мокап для продукта */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className='mt-20 relative mx-auto max-w-5xl group perspective-1000'
        >
          <div className='absolute -inset-1 bg-gradient-to-r from-primary to-blue-600 rounded-[32px] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500' />

          <div className='relative rounded-[24px] border border-border/50 bg-background/50 backdrop-blur-xl shadow-2xl overflow-hidden'>
            <div className='flex items-center px-4 py-3 border-b border-border/50 bg-muted/30'>
              <div className='flex gap-2'>
                <div className='w-3 h-3 rounded-full bg-red-500/80' />
                <div className='w-3 h-3 rounded-full bg-amber-500/80' />
                <div className='w-3 h-3 rounded-full bg-emerald-500/80' />
              </div>
              <div className='mx-auto px-4 py-1 text-[10px] font-mono text-muted-foreground bg-background rounded-md border shadow-inner hidden sm:block'>
                app.watchwise.ru/dashboard/video/gaussuan-method
              </div>
            </div>

            <div className='aspect-video bg-muted/20 relative flex items-center justify-center overflow-hidden'>
              <video
                src='/demo-video.mp4'
                autoPlay
                loop
                muted
                playsInline
                className='w-full h-full object-cover rounded-b-[24px]'
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
