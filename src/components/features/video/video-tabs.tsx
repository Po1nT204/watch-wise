import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, MessageSquare, GraduationCap } from 'lucide-react';
import { usePlayerStore } from '@/store/use-player-store';

interface VideoTabsProps {
  video: any; // Сюда придут данные из страницы
}

export function VideoTabs({ video }: VideoTabsProps) {
  const seekTo = usePlayerStore((state) => state.seekTo);
  const transcript = video?.transcriptChunks || [];
  const content = video?.generatedContents?.[0];
  const questions = content?.questions || [];

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
              <div className='text-sm text-muted-foreground space-y-4'>
                {transcript.length > 0 ? (
                  transcript.map((chunk: any) => (
                    <div
                      key={chunk.id}
                      className='group cursor-pointer hover:bg-muted p-2 rounded-md transition-colors border-l-2 border-transparent hover:border-primary'
                      onClick={() => seekTo(chunk.startTime)}
                    >
                      <span className='text-[10px] font-mono text-primary'>
                        [{Math.floor(chunk.startTime / 60)}:
                        {Math.floor(chunk.startTime % 60)
                          .toString()
                          .padStart(2, '0')}
                        ]
                      </span>
                      <p className='mt-1 text-foreground leading-relaxed'>
                        {chunk.text}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className='italic'>
                    Здесь будет отображаться структурированный конспект видео
                    после анализа.
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
                questions.map((q: any, idx: number) => (
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
