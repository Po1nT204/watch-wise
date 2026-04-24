import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GraduationCap } from 'lucide-react';
import { EditQuestionDialog } from '../edit-question-dialog';
import { DeleteQuestionButton } from '../delete-question-button';
import { formatDisplayTime } from '@/lib/time-utils';
import { AnalysisMode, QuizQuestion } from '@/shared/types';

interface QuizTabProps {
  questions: QuizQuestion[];
  mode: AnalysisMode;
  videoId: string;
}

export function QuizTab({ questions, mode, videoId }: QuizTabProps) {
  if (questions.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center h-full min-h-[300px] text-muted-foreground border border-dashed rounded-md text-center p-6'>
        <GraduationCap className='h-8 w-8 mb-2 opacity-20' />
        <p className='text-sm'>Тестирование станет доступно после анализа</p>
      </div>
    );
  }

  return (
    <ScrollArea className='flex-1 p-4 min-h-0'>
      <div className='space-y-4 pb-4'>
        {questions.map((q, idx) => (
          <Card
            key={q.id}
            className='p-4 border-muted shadow-none shrink-0 group relative'
          >
            <div className='flex justify-between items-start gap-4'>
              <p className='text-sm font-semibold leading-tight flex-1 mt-1'>
                <span className='text-muted-foreground mr-1'>
                  [{formatDisplayTime(q.timestamp)}]
                </span>
                {idx + 1}. {q.text}
              </p>
              {mode === 'teacher' && (
                <div className='flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 bg-card rounded-md border shadow-sm'>
                  <EditQuestionDialog question={q} videoId={videoId} />
                  <DeleteQuestionButton questionId={q.id} videoId={videoId} />
                </div>
              )}
            </div>

            <div className='mt-4 grid gap-2'>
              {(q.options as string[]).map((opt, i) => (
                <div
                  key={i}
                  className={`text-[12px] p-2.5 rounded border transition-colors ${
                    mode === 'teacher' && i === q.correctIdx
                      ? 'bg-primary/10 border-primary/30 font-medium text-foreground'
                      : 'bg-muted/30 text-muted-foreground'
                  }`}
                >
                  {opt}
                  {mode === 'teacher' && i === q.correctIdx && (
                    <span className='ml-2 text-[10px] text-primary font-bold uppercase tracking-wider'>
                      Правильный ответ
                    </span>
                  )}
                </div>
              ))}
            </div>

            {mode === 'teacher' && q.explanation && (
              <div className='mt-3 p-3 bg-muted/50 rounded-md border-l-2 border-primary/50 text-xs italic text-muted-foreground'>
                <span className='font-semibold text-foreground not-italic mr-1'>
                  Пояснение:
                </span>
                {q.explanation}
              </div>
            )}
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
