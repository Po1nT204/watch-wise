'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { startAnalysis } from '@/server-actions/video';
import {
  Brain,
  CheckCircle2,
  Cpu,
  Download,
  GraduationCap,
  Loader2,
  Mic,
  Sparkles,
} from 'lucide-react';
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
import {
  AnalysisAudience,
  AnalysisDifficulty,
  AnalysisFocus,
  AnalysisMode,
} from '@/shared/types';
import { motion } from 'framer-motion';

const PROCESSING_STEPS = [
  { text: 'Подготовка среды...', icon: Loader2 },
  { text: 'Извлечение медиапотока...', icon: Download },
  { text: 'Распознавание речи (SpeechKit)...', icon: Mic },
  { text: 'Генерация тестов (YandexGPT)...', icon: Cpu },
  { text: 'Финализация результатов...', icon: Sparkles },
];

export function AnalysisControl({
  videoId,
  status,
}: {
  videoId: string;
  status: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [mode, setMode] = useState<AnalysisMode>('student');
  const [difficulty, setDifficulty] = useState<AnalysisDifficulty>('medium');
  const [questionsCount, setQuestionsCount] = useState<number>(5);
  const [audience, setAudience] = useState<AnalysisAudience>('student');
  const [focus, setFocus] = useState<AnalysisFocus>('theory');

  const router = useRouter();
  const isProcessing = isLoading || status === 'PROCESSING';

  useEffect(() => {
    if (!isProcessing) {
      setStepIndex(0);
      return;
    }

    const intervals = [3000, 10000, 20000, 35000];
    const timeouts = intervals.map((time) =>
      setTimeout(() => {
        setStepIndex((prev) => Math.min(prev + 1, PROCESSING_STEPS.length - 1));
      }, time),
    );

    return () => timeouts.forEach(clearTimeout);
  }, [isProcessing]);

  const handleStart = async () => {
    if (questionsCount < 1 || questionsCount > 20) {
      toast.error('Количество вопросов должно быть от 1 до 20');
      return;
    }

    setIsLoading(true);
    const result = await startAnalysis(videoId, {
      mode,
      difficulty,
      questionsCount,
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
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className='flex flex-col items-center justify-center py-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl'
      >
        <CheckCircle2 className='h-12 w-12 text-emerald-500 mb-2' />
        <p className='text-emerald-600 font-bold'>Анализ успешно завершен!</p>
        <p className='text-xs text-emerald-600/70'>
          Материалы доступны во вкладках
        </p>
      </motion.div>
    );

  if (isProcessing) {
    const StepIcon = PROCESSING_STEPS[stepIndex].icon;
    return (
      <div className='flex flex-col items-center justify-center p-8 bg-background border rounded-xl shadow-inner overflow-hidden relative'>
        <div className='absolute inset-0 bg-primary/5 animate-pulse' />

        <motion.div
          key={stepIndex}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          className='relative z-10 flex flex-col items-center'
        >
          <div className='p-4 bg-primary/10 rounded-full mb-4'>
            <StepIcon
              className={`h-8 w-8 text-primary ${StepIcon === Loader2 ? 'animate-spin' : 'animate-bounce'}`}
            />
          </div>
          <h3 className='text-lg font-bold text-foreground text-center'>
            {PROCESSING_STEPS[stepIndex].text}
          </h3>
          <div className='w-48 h-1.5 bg-muted rounded-full mt-4 overflow-hidden'>
            <motion.div
              className='h-full bg-primary'
              initial={{
                width: `${(stepIndex / PROCESSING_STEPS.length) * 100}%`,
              }}
              animate={{
                width: `${((stepIndex + 1) / PROCESSING_STEPS.length) * 100}%`,
              }}
              transition={{ duration: 5, ease: 'linear' }}
            />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-5'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {/* Режим */}
        <div className='space-y-2'>
          <Label className='text-[11px] uppercase font-bold text-muted-foreground'>
            Режим UI
          </Label>
          <Select
            value={mode}
            onValueChange={(val) => setMode(val as AnalysisMode)}
          >
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
          <Select
            value={audience}
            onValueChange={(val) => setAudience(val as AnalysisAudience)}
          >
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
          <Select
            value={focus}
            onValueChange={(val) => setFocus(val as AnalysisFocus)}
          >
            <SelectTrigger className='bg-background'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent
              position='popper'
              sideOffset={4}
              className='bg-background shadow-md z-50'
            >
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
          <Select
            value={difficulty}
            onValueChange={(val) => setDifficulty(val as AnalysisDifficulty)}
          >
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
      <div className='space-y-3 bg-background p-4 rounded-md border'>
        <div className='flex justify-between items-center'>
          <Label className='text-[11px] uppercase font-bold text-muted-foreground'>
            Максимум вопросов в тесте
          </Label>
          <span className='font-black text-primary'>{questionsCount} шт.</span>
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
        <p className='text-[10px] text-muted-foreground text-center pt-1'>
          ИИ может сгенерировать меньше вопросов для короткого видео.
        </p>
      </div>

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
  );
}
