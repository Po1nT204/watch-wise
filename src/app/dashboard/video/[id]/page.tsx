import { auth } from '@/config/auth';
import { redirect, notFound } from 'next/navigation';
import { getVideoById } from '@/services/video';
import { VideoPlayer } from '@/components/features/video/video-player';
import { VideoTabs } from '@/components/features/video/video-tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { AnalysisControl } from '@/components/features/video/analysis-control';

interface VideoPageProps {
  params: Promise<{ id: string }>;
}

export default async function VideoPage({ params }: VideoPageProps) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user?.id) {
    redirect('/login');
  }

  const video = await getVideoById(id, session.user.id);

  if (!video) {
    notFound();
  }

  return (
    <div className='flex flex-col h-[calc(100vh-4rem)]'>
      <div className='flex items-center gap-4 border-b p-4'>
        <Button variant='ghost' size='icon' asChild>
          <Link href='/dashboard'>
            <ArrowLeft className='h-4 w-4' />
          </Link>
        </Button>
        <div className='flex-1'>
          <h1 className='text-lg font-semibold truncate max-w-2xl'>
            {video.title || 'Без названия'}
          </h1>
          <div className='flex items-center gap-2 text-xs text-muted-foreground'>
            <span>{video.platform}</span>
            {video.duration && (
              <span>• {Math.floor(video.duration / 60)} мин</span>
            )}
          </div>
        </div>
        <Badge variant='secondary'>
          {video.generatedContents && video.generatedContents.length > 0
            ? 'Обработано'
            : 'Ожидает анализа'}
        </Badge>
      </div>

      <div className='flex-1 overflow-hidden p-4 md:p-6'>
        <div className='grid h-full gap-6 md:grid-cols-[1.5fr_1fr]'>
          <div className='flex flex-col gap-4'>
            <VideoPlayer url={video.url} />

            <div className='p-4 bg-muted/30 rounded-lg border'>
              <p className='text-sm font-medium mb-3'>Управление анализом</p>
              <AnalysisControl videoId={video.id} status={video.status} />
            </div>
          </div>

          <div className='h-full overflow-hidden rounded-xl border bg-background shadow-sm'>
            <VideoTabs />
          </div>
        </div>
      </div>
    </div>
  );
}
