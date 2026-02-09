import { notFound, redirect } from 'next/navigation';
import { getVideoById } from '@/services/video';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { auth } from '@/config/auth';
import { VideoViewClient } from '@/components/features/video/video-view-client';

interface VideoPageProps {
  params: Promise<{ id: string }>;
}

export default async function VideoPage({ params }: VideoPageProps) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user?.id) redirect('/login');

  const video = await getVideoById(id, session.user.id);
  if (!video) notFound();

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
        <VideoViewClient video={video} />
      </div>
    </div>
  );
}
