'use client';

interface VkPlayerProps {
  ownerId: string;
  videoId: string;
}

export function VkPlayer({ ownerId, videoId }: VkPlayerProps) {
  return (
    <div className='relative aspect-video overflow-hidden rounded-xl border bg-black shadow-sm'>
      <iframe
        src={`https://vk.com/video_ext.php?oid=${ownerId}&id=${videoId}&hd=2`}
        className='absolute top-0 left-0 w-full h-full'
        allow='autoplay; encrypted-media; fullscreen;'
        frameBorder='0'
        allowFullScreen
      />
    </div>
  );
}
