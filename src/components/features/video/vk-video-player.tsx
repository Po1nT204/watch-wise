'use client';

export function VKPlayer({ videoId }: { videoId: string }) {
  // videoId для VK будет в формате "-175987163_456308875"
  const src = `https://vk.com/video_ext.php?oid=${videoId.split('_')[0]}&id=${videoId.split('_')[1]}&hd=2`;

  return (
    <div className='relative aspect-video overflow-hidden rounded-xl border bg-black shadow-sm'>
      <iframe
        src={src}
        className='absolute top-0 left-0 w-full h-full'
        allow='autoplay; encrypted-media; fullscreen; picture-in-picture;'
        frameBorder='0'
        allowFullScreen
      />
    </div>
  );
}
