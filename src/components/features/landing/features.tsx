import { Brain, Zap, Clock, Target } from 'lucide-react';

const features = [
  {
    title: 'AI Саммари',
    desc: 'Получайте краткую выжимку ключевых идей видео за считанные секунды.',
    icon: Brain,
    color: 'bg-blue-500/10 text-blue-600',
  },
  {
    title: 'Умная пауза',
    desc: 'Видео останавливается в нужный момент, чтобы проверить ваши знания.',
    icon: Zap,
    color: 'bg-amber-500/10 text-amber-600',
  },
  {
    title: 'Интерактивные тесты',
    desc: 'Вопросы генерируются на основе реального содержания ролика.',
    icon: Target,
    color: 'bg-emerald-500/10 text-emerald-600',
  },
  {
    title: 'Экономия времени',
    desc: 'Больше не нужно пересматривать часовые лекции ради одной детали.',
    icon: Clock,
    color: 'bg-purple-500/10 text-purple-600',
  },
];

export function Features() {
  return (
    <section className='py-24 bg-muted/30'>
      <div className='container mx-auto px-4'>
        <div className='text-center mb-16'>
          <h2 className='text-3xl font-bold mb-4'>
            Почему выбирают WatchWise?
          </h2>
          <p className='text-muted-foreground'>
            Мы используем лучшие технологии для вашего прогресса
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
          {features.map((f, i) => (
            <div
              key={i}
              className='p-6 rounded-2xl border bg-card hover:shadow-xl transition-all duration-300'
            >
              <div
                className={`w-12 h-12 rounded-lg ${f.color} flex items-center justify-center mb-4`}
              >
                <f.icon className='h-6 w-6' />
              </div>
              <h3 className='font-bold text-lg mb-2'>{f.title}</h3>
              <p className='text-sm text-muted-foreground leading-relaxed'>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
