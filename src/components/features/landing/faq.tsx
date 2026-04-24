import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export function FAQ() {
  return (
    <section className='py-24'>
      <div className='container mx-auto px-4 max-w-3xl'>
        <div className='text-center mb-12'>
          <h2 className='text-3xl font-bold mb-4'>Частые вопросы</h2>
          <p className='text-muted-foreground'>
            Все, что нужно знать о работе WatchWise
          </p>
        </div>
        <Accordion type='single' collapsible className='w-full'>
          <AccordionItem value='item-1'>
            <AccordionTrigger>Какие платформы поддерживаются?</AccordionTrigger>
            <AccordionContent>
              На данный момент мы поддерживаем ссылки на YouTube и VK Video. Мы
              планируем расширить этот список в будущем.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value='item-2'>
            <AccordionTrigger>
              Как работает &ldquo;Умная пауза&rdquo;?
            </AccordionTrigger>
            <AccordionContent>
              Платформа анализирует транскрипт видео с помощью ИИ и находит
              ключевые смысловые блоки. Во время просмотра плеер автоматически
              остановится сразу после объяснения важного концепта и предложит
              проверочный вопрос.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value='item-3'>
            <AccordionTrigger>
              Могу ли я редактировать сгенерированные тесты?
            </AccordionTrigger>
            <AccordionContent>
              Да! Если вы выберете режим &ldquo;Преподаватель&rdquo; перед
              началом анализа, у вас появится возможность изменять текст
              вопросов, варианты ответов и таймкоды перед тем, как поделиться
              материалом.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  );
}
