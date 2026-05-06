'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqData = [
  {
    question: 'Какие платформы поддерживаются?',
    answer:
      'На данный момент платформа работает со ссылками на YouTube и VK Video. Мы планируем расширение списка в будущем.',
  },
  {
    question: 'Как работает механика «Умной паузы»?',
    answer:
      'Нейросеть (YandexGPT) анализирует текстовую расшифровку видео и находит логические завершения смысловых блоков. Во время просмотра плеер автоматически останавливается в этих точках и выводит проверочный вопрос. Продолжить просмотр можно только после ответа.',
  },
  {
    question: 'Что делать, если у видео нет встроенных субтитров?',
    answer:
      'WatchWise справится и с этим! Если нативных субтитров нет, наша система автоматически скачает аудиодорожку и пропустит её через систему распознавания речи (Yandex SpeechKit), создав точный транскрипт с таймкодами.',
  },
  {
    question: 'Могу ли я редактировать сгенерированные тесты?',
    answer:
      'Да. Перед началом анализа вы можете выбрать режим «Учитель» вместо режима «Студент». Это даст вам полные права на изменение текста вопросов, вариантов ответов и таймкодов появления умной паузы перед отправкой материалов ученикам.',
  },
  {
    question: 'Как работает система опыта (XP) и уровней?',
    answer:
      'За каждый правильный ответ в тесте и за полностью изученное видео вы получаете очки опыта (XP). Накапливая опыт, вы повышаете свой уровень. Также система отслеживает ваши «стрики» (дни обучения подряд), мотивируя заниматься регулярно.',
  },
  {
    question: 'Это бесплатно?',
    answer:
      'WatchWise — это некоммерческий образовательный проект, разработанный в рамках Выпускной Квалификационной Работы. Базовый функционал предоставляется абсолютно бесплатно.',
  },
];

export function FAQ() {
  return (
    <section className='py-32 bg-background'>
      <div className='container mx-auto px-4 max-w-4xl'>
        <div className='text-center mb-16'>
          <h2 className='text-4xl font-black mb-4 tracking-tight'>
            Частые вопросы
          </h2>
          <p className='text-lg text-muted-foreground'>
            Всё, что нужно знать о работе алгоритмов и платформы WatchWise
          </p>
        </div>

        <Accordion type='single' collapsible className='w-full space-y-4'>
          {faqData.map((item, index) => (
            <AccordionItem
              key={`faq-${index}`}
              value={`item-${index}`}
              className='bg-card border border-border/50 rounded-2xl px-6 data-[state=open]:shadow-md data-[state=open]:border-primary/30 transition-all duration-300'
            >
              <AccordionTrigger className='text-left text-lg font-bold hover:no-underline py-6'>
                {item.question}
              </AccordionTrigger>
              <AccordionContent className='text-muted-foreground text-base leading-relaxed pb-6'>
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
