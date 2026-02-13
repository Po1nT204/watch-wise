'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { startAnalysis } from '@/server-actions/video';
import { Brain, GraduationCap, Loader2, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function AnalysisControl({
  videoId,
  status,
}: {
  videoId: string;
  status: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState('student');
  const [difficulty, setDifficulty] = useState('medium');
  const [questionsCount, setQuestionsCount] = useState('5');
  const router = useRouter();

  const handleStart = async () => {
    setIsLoading(true);
    await startAnalysis(videoId, {
      mode,
      difficulty,
      questionsCount: parseInt(questionsCount),
    });
    setIsLoading(false);
    router.refresh();
  };

  if (status === 'COMPLETED')
    return (
      <p className='text-sm text-green-600 font-medium'>
        Анализ завершен успешно!
      </p>
    );
  if (status === 'PROCESSING')
    return (
      <div className='flex items-center gap-2 text-sm text-blue-600'>
        <Loader2 className='h-4 w-4 animate-spin' /> ИИ анализирует контент...
      </div>
    );

  return (
    <div className='flex flex-col gap-6 p-2'>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        {/* Режим */}
        <div className='space-y-2'>
          <Label className='text-[11px] uppercase font-bold text-muted-foreground'>
            Режим
          </Label>
          <Select value={mode} onValueChange={setMode}>
            <SelectTrigger className='bg-background'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='student'>
                <div className='flex items-center gap-2'>
                  <GraduationCap className='h-4 w-4' /> Студент
                </div>
              </SelectItem>
              <SelectItem value='teacher'>
                <div className='flex items-center gap-2'>
                  <Brain className='h-4 w-4' /> Учитель
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Сложность */}
        <div className='space-y-2'>
          <Label className='text-[11px] uppercase font-bold text-muted-foreground'>
            Сложность
          </Label>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger className='bg-background'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='easy'>Легко</SelectItem>
              <SelectItem value='medium'>Средне</SelectItem>
              <SelectItem value='hard'>Сложно</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Вопросы */}
        <div className='space-y-2'>
          <Label className='text-[11px] uppercase font-bold text-muted-foreground'>
            Вопросов
          </Label>
          <Select value={questionsCount} onValueChange={setQuestionsCount}>
            <SelectTrigger className='bg-background'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='5'>5 вопросов</SelectItem>
              <SelectItem value='10'>10 вопросов</SelectItem>
              <SelectItem value='15'>15 вопросов</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        onClick={handleStart}
        disabled={isLoading || status === 'PROCESSING'}
        size='lg'
        className='w-full font-bold shadow-lg shadow-primary/20'
      >
        {isLoading || status === 'PROCESSING' ? (
          <>
            <Loader2 className='mr-2 h-5 w-5 animate-spin' />
            Нейросеть изучает видео...
          </>
        ) : (
          <>
            <Sparkles className='mr-2 h-5 w-5' />
            Запустить полный анализ
          </>
        )}
      </Button>
    </div>
  );
}
