'use client';

import { Brain, Zap, Target, Sparkles, LayoutDashboard } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { Card } from '@/components/ui/card';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', bounce: 0.4 } },
};

export function Features() {
  return (
    <section className='py-32 bg-muted/30 relative border-t'>
      <div className='container mx-auto px-4 max-w-6xl'>
        <div className='text-center mb-20'>
          <h2 className='text-4xl md:text-5xl font-black mb-6 tracking-tight'>
            Один инструмент для <span className='text-primary'>всех задач</span>
          </h2>
          <p className='text-xl text-muted-foreground max-w-2xl mx-auto'>
            Мы автоматизировали самую скучную часть обучения, чтобы вы могли
            сфокусироваться на главном.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial='hidden'
          whileInView='show'
          viewport={{ once: true, margin: '-100px' }}
          className='grid grid-cols-1 md:grid-cols-3 gap-6'
        >
          <motion.div variants={itemVariants} className='md:col-span-2'>
            <Card className='h-full bg-gradient-to-br from-background to-primary/5 border-primary/20 p-8 overflow-hidden relative group hover:shadow-lg transition-all'>
              <div className='absolute top-0 right-0 p-8 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500'>
                <Zap className='w-48 h-48' />
              </div>
              <div className='w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center mb-6 shadow-lg shadow-primary/30'>
                <Zap className='h-7 w-7' />
              </div>
              <h3 className='font-black text-2xl mb-3'>
                Умная пауза (Smart Pause)
              </h3>
              <p className='text-muted-foreground text-lg leading-relaxed max-w-md'>
                Смотрите видео как обычно. Платформа сама распознает ключевые
                смысловые блоки и остановит воспроизведение в нужный момент,
                чтобы задать проверочный вопрос. Не ответил — не смотришь
                дальше.
              </p>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className='h-full bg-card p-8 hover:border-blue-500/30 hover:shadow-md transition-all'>
              <div className='w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-6'>
                <Brain className='h-6 w-6' />
              </div>
              <h3 className='font-bold text-xl mb-3'>AI Конспекты</h3>
              <p className='text-muted-foreground'>
                Получайте структурированную текстовую выжимку с кликабельными
                таймкодами.
              </p>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className='h-full bg-card p-8 hover:border-emerald-500/30 hover:shadow-md transition-all'>
              <div className='w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-6'>
                <Target className='h-6 w-6' />
              </div>
              <h3 className='font-bold text-xl mb-3'>Генерация тестов</h3>
              <p className='text-muted-foreground'>
                Модель YandexGPT автоматически генерирует вопросы разной
                сложности на основе произнесенного в видео текста.
              </p>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className='h-full bg-card p-8 hover:border-amber-500/30 hover:shadow-md transition-all'>
              <div className='w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-6'>
                <Sparkles className='h-6 w-6' />
              </div>
              <h3 className='font-bold text-xl mb-3'>Глоссарий терминов</h3>
              <p className='text-muted-foreground'>
                ИИ вычленяет сложные термины и создает интерактивные
                флеш-карточки для заучивания.
              </p>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className='h-full bg-card p-8 hover:border-purple-500/30 hover:shadow-md transition-all'>
              <div className='w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center mb-6'>
                <LayoutDashboard className='h-6 w-6' />
              </div>
              <h3 className='font-bold text-xl mb-3'>Аналитика и XP</h3>
              <p className='text-muted-foreground'>
                Отслеживайте свой прогресс, получайте очки опыта (XP) за
                правильные ответы и повышайте уровни.
              </p>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
