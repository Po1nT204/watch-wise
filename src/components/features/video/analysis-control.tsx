'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { startAnalysis } from '@/server-actions/video';
import { Brain, GraduationCap, Loader2, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
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
  const [questionsCount, setQuestionsCount] = useState<number>(5);
  const [audience, setAudience] = useState('student');
  const [focus, setFocus] = useState('theory');

  const router = useRouter();

  const handleStart = async () => {
    if (questionsCount < 1 || questionsCount > 20) {
      toast.error('Количество вопросов должно быть от 1 до 20');
      return;
    }

    setIsLoading(true);
    const result = await startAnalysis(videoId, {
      mode,
      difficulty,
      questionsCount: questionsCount,
      audience,
      focus,
    });
    setIsLoading(false);

    if (result?.error) {
      toast.error(result.error);
    }
    router.refresh();
  };

  if (status === 'COMPLETED')
    return (
      <p className='text-sm text-green-600 font-medium text-center py-4'>
        Анализ завершен успешно!
      </p>
    );
  if (status === 'PROCESSING')
    return (
      <div className='flex items-center justify-center gap-2 text-sm text-primary py-4'>
        <Loader2 className='h-4 w-4 animate-spin' /> ИИ анализирует контент...
      </div>
    );

  return (
    <div className='flex flex-col h-full max-h-[500px]'>
      {/* Скроллируемая область настроек */}
      <div className='flex-1 overflow-y-auto pr-2 pb-4 space-y-5 custom-scrollbar'>
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
              <SelectContent
                position='popper'
                sideOffset={4}
                className='bg-background shadow-md z-50'
              >
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

          {/* Аудитория */}
          <div className='space-y-2'>
            <Label className='text-[11px] uppercase font-bold text-muted-foreground'>
              Подача материала
            </Label>
            <Select value={audience} onValueChange={setAudience}>
              <SelectTrigger className='bg-background'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                position='popper'
                sideOffset={4}
                className='bg-background shadow-md z-50'
              >
                <SelectItem value='schoolboy'>Школьнику (просто)</SelectItem>
                <SelectItem value='student'>Студенту (баланс)</SelectItem>
                <SelectItem value='expert'>Эксперту (строго)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Фокус анализа */}
          <div className='space-y-2'>
            <Label className='text-[11px] uppercase font-bold text-muted-foreground'>
              Фокус анализа
            </Label>
            <Select value={focus} onValueChange={setFocus}>
              <SelectTrigger className='bg-background'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                position='popper'
                sideOffset={4}
                className='bg-background shadow-md z-50'
              >
                <SelectItem value='theory'>Фундаментальная теория</SelectItem>
                <SelectItem value='practice'>
                  Практическое применение
                </SelectItem>
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
              <SelectContent
                position='popper'
                sideOffset={4}
                className='bg-background shadow-md z-50'
              >
                <SelectItem value='easy'>Базовые знания</SelectItem>
                <SelectItem value='medium'>Понимание причин</SelectItem>
                <SelectItem value='hard'>Анализ и выводы</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Ползунок количества вопросов */}
        <div className='space-y-3 pt-2 bg-background p-3 rounded-md border'>
          <div className='flex justify-between items-center'>
            <Label className='text-[11px] uppercase font-bold text-muted-foreground'>
              Вопросов в тесте
            </Label>
            <span className='font-black text-primary'>
              {questionsCount} шт.
            </span>
          </div>
          <input
            type='range'
            min={1}
            max={20}
            step={1}
            value={questionsCount}
            onChange={(e) => setQuestionsCount(parseInt(e.target.value))}
            className='w-full accent-primary h-2 bg-muted rounded-lg appearance-none cursor-pointer'
          />
          <p className='text-[10px] text-muted-foreground text-center'>
            ИИ может сгенерировать меньше, если видео слишком короткое.
          </p>
        </div>
      </div>

      {/* Фиксированная кнопка внизу */}
      <div className='pt-2 mt-auto shrink-0'>
        <Button
          onClick={handleStart}
          disabled={isLoading || status === 'PROCESSING'}
          size='lg'
          className='w-full font-bold shadow-md shadow-primary/20'
        >
          {isLoading || status === 'PROCESSING' ? (
            <>
              <Loader2 className='mr-2 h-5 w-5 animate-spin' /> Анализ...
            </>
          ) : (
            <>
              <Sparkles className='mr-2 h-5 w-5' /> Запустить анализ
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
