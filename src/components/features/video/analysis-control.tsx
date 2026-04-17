'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { startAnalysis } from '@/server-actions/video';
import { Brain, GraduationCap, Loader2, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
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
  const [audience, setAudience] = useState('student');
  const [focus, setFocus] = useState('theory');

  const router = useRouter();

  const handleStart = async () => {
    const count = parseInt(questionsCount);
    if (isNaN(count) || count < 1 || count > 20) {
      toast.error('Количество вопросов должно быть от 1 до 20');
      return;
    }

    setIsLoading(true);
    const result = await startAnalysis(videoId, {
      mode,
      difficulty,
      questionsCount: count,
      audience,
      focus,
    });
    setIsLoading(false);

    if (result?.error) {
      // Выводим конкретную ошибку (например, блокировку фильтрами)
      toast.error(result.error);
    }
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
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {/* Режим */}
        <div className='space-y-2'>
          <Label className='text-[11px] uppercase font-bold text-muted-foreground'>
            Режим UI
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

        {/* Аудитория (Новое) */}
        <div className='space-y-2'>
          <Label className='text-[11px] uppercase font-bold text-muted-foreground'>
            Подача материала
          </Label>
          <Select value={audience} onValueChange={setAudience}>
            <SelectTrigger className='bg-background'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='schoolboy'>Как школьнику (просто)</SelectItem>
              <SelectItem value='student'>Студенту (баланс)</SelectItem>
              <SelectItem value='expert'>Эксперту (академично)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Фокус (Новое) */}
        <div className='space-y-2'>
          <Label className='text-[11px] uppercase font-bold text-muted-foreground'>
            Фокус анализа
          </Label>
          <Select value={focus} onValueChange={setFocus}>
            <SelectTrigger className='bg-background'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='theory'>Фундаментальная теория</SelectItem>
              <SelectItem value='practice'>Практическое применение</SelectItem>
              <SelectItem value='facts'>Даты, имена и факты</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Сложность тестов */}
        <div className='space-y-2'>
          <Label className='text-[11px] uppercase font-bold text-muted-foreground'>
            Сложность тестов
          </Label>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger className='bg-background'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='easy'>Базовые факты</SelectItem>
              <SelectItem value='medium'>Понимание причин</SelectItem>
              <SelectItem value='hard'>Анализ и выводы</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Кол-во вопросов */}
        <div className='space-y-2 md:col-span-2'>
          <Label className='text-[11px] uppercase font-bold text-muted-foreground'>
            Максимум вопросов (1-20)
          </Label>
          <Input
            type='number'
            min={1}
            max={20}
            value={questionsCount}
            onChange={(e) => setQuestionsCount(e.target.value)}
            className='bg-background'
          />
          <p className='text-[10px] text-muted-foreground mt-1'>
            ИИ может сгенерировать меньше, если видео короткое.
          </p>
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
            <Loader2 className='mr-2 h-5 w-5 animate-spin' /> Нейросеть изучает
            видео...
          </>
        ) : (
          <>
            <Sparkles className='mr-2 h-5 w-5' /> Запустить умный анализ
          </>
        )}
      </Button>
    </div>
  );
}
