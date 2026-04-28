import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getYoutubeVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);

  return match && match[2].length === 11 ? match[2] : null;
}

export function getYoutubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

export function parseVideoUrl(
  url: string,
): { id: string; platform: 'youtube' | 'vk' } | null {
  const ytMatch = url.match(
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/,
  );
  if (ytMatch && ytMatch[2].length === 11) {
    return { id: ytMatch[2], platform: 'youtube' };
  }

  const vkMatch = url.match(/video(-?\d+_\d+)/);
  if (vkMatch) {
    return { id: vkMatch[1], platform: 'vk' };
  }

  return null;
}
