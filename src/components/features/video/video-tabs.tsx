'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, GraduationCap } from 'lucide-react';

interface VideoTabsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  video: any; // Сюда придут данные из страницы
  onTimestampClick: (time: number) => void;
}

interface Chunk {
  id: string;
  startTime: number;
  text: string;
}

interface Question {
  id: string;
  text: string;
  options: string[];
}

export function VideoTabs({ video, onTimestampClick }: VideoTabsProps) {
  const transcript: Chunk[] = video?.transcriptChunks || [];
  const content = video?.generatedContents?.[0];
  const questions: Question[] = content?.questions || [];

  return (
    <Tabs defaultValue='summary' className='w-full h-full flex flex-col'>
      <TabsList className='grid w-full grid-cols-2'>
        <TabsTrigger value='summary'>
          <FileText className='w-4 h-4 mr-2' />
          Саммари
        </TabsTrigger>
        <TabsTrigger value='quiz'>
          <GraduationCap className='w-4 h-4 mr-2' />
          Тест
        </TabsTrigger>
      </TabsList>

      {/* Контент вкладок оборачиваем в ScrollArea, чтобы скроллился только текст, а плеер стоял на месте */}
      <div className='flex-1 mt-4 min-h-0'>
        <TabsContent value='summary' className='h-full m-0'>
          <Card className='h-full flex flex-col border-none shadow-none'>
            <CardHeader>
              <CardTitle>Краткое содержание</CardTitle>
              <CardDescription>Сгенерировано YandexGPT</CardDescription>
            </CardHeader>
            <ScrollArea className='flex-1 p-4 h-[400px]'>
              <div className='text-sm space-y-4'>
                {/* 1. Если есть Саммари от ИИ — показываем его */}
                {content?.summary ? (
                  <div className='prose prose-sm dark:prose-invert max-w-none text-foreground leading-relaxed whitespace-pre-wrap'>
                    {content.summary}
                  </div>
                ) : transcript.length > 0 ? (
                  /* 2. Если Саммари нет, но есть транскрипт — показываем его как фолбэк */
                  <div className='space-y-4 text-muted-foreground'>
                    <p className='text-xs font-bold uppercase text-primary'>
                      Полный транскрипт (анализ не запущен):
                    </p>
                    {transcript.map((chunk) => (
                      <div
                        key={chunk.id}
                        className='group cursor-pointer hover:bg-muted p-2 rounded-md transition-colors border-l-2 border-transparent hover:border-primary'
                        onClick={() => onTimestampClick(chunk.startTime)}
                      >
                        <span className='text-[10px] font-mono text-primary'>
                          [{Math.floor(chunk.startTime / 60)}:
                          {Math.floor(chunk.startTime % 60)
                            .toString()
                            .padStart(2, '0')}
                          ]
                        </span>
                        <p className='mt-1 text-foreground'>{chunk.text}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className='italic text-muted-foreground'>
                    Здесь появится конспект после анализа.
                  </p>
                )}
              </div>
            </ScrollArea>
          </Card>
        </TabsContent>

        <TabsContent value='quiz' className='h-full m-0'>
          <ScrollArea className='h-[400px] p-4'>
            <div className='space-y-4'>
              {questions.length > 0 ? (
                questions.map((q, idx) => (
                  <Card key={q.id} className='p-4'>
                    <p className='text-sm font-medium'>
                      {idx + 1}. {q.text}
                    </p>
                    <div className='mt-3 grid gap-2'>
                      {q.options.map((opt: string, i: number) => (
                        <div
                          key={i}
                          className='text-xs p-2 rounded border bg-muted/50'
                        >
                          {opt}
                        </div>
                      ))}
                    </div>
                  </Card>
                ))
              ) : (
                <div className='flex items-center justify-center h-[300px] text-muted-foreground border border-dashed rounded-md'>
                  Тестирование станет доступно после анализа
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </div>
    </Tabs>
  );
}
