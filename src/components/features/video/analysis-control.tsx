'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { startAnalysis } from '@/server-actions/video';
import { Loader2, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function AnalysisControl({
  videoId,
  status,
}: {
  videoId: string;
  status: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleStart = async () => {
    setIsLoading(true);
    await startAnalysis(videoId);
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
    <Button onClick={handleStart} disabled={isLoading} className='w-full'>
      {isLoading ? (
        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
      ) : (
        <Sparkles className='mr-2 h-4 w-4' />
      )}
      Запустить AI-анализ
    </Button>
  );
}
