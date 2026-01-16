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

export function VideoTabs() {
  return (
    <Tabs defaultValue='summary' className='w-full h-full flex flex-col'>
      <TabsList className='grid w-full grid-cols-3'>
        <TabsTrigger value='summary'>
          <FileText className='w-4 h-4 mr-2' />
          Конспект
        </TabsTrigger>
        <TabsTrigger value='chat'>
          <MessageSquare className='w-4 h-4 mr-2' />
          Чат
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
                <p>
                  Здесь будет отображаться структурированный конспект видео...
                </p>
                <div className='h-4 w-3/4 bg-muted animate-pulse rounded' />
                <div className='h-4 w-1/2 bg-muted animate-pulse rounded' />
                <div className='h-4 w-full bg-muted animate-pulse rounded' />
              </div>
            </ScrollArea>
          </Card>
        </TabsContent>

        <TabsContent value='chat' className='h-full m-0'>
          <div className='flex items-center justify-center h-[400px] text-muted-foreground border border-dashed rounded-md'>
            Чат с видео (в разработке)
          </div>
        </TabsContent>

        <TabsContent value='quiz' className='h-full m-0'>
          <div className='flex items-center justify-center h-[400px] text-muted-foreground border border-dashed rounded-md'>
            Тестирование (в разработке)
          </div>
        </TabsContent>
      </div>
    </Tabs>
  );
}
