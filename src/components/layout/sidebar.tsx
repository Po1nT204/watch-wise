'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Library, Settings, Video } from 'lucide-react';

const routes = [
  {
    label: 'Главная',
    icon: LayoutDashboard,
    href: '/dashboard',
  },
  {
    label: 'Мои видео',
    icon: Library,
    href: '/dashboard/videos',
  },
  {
    label: 'Настройки',
    icon: Settings,
    href: '/dashboard/settings',
  },
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <div className='flex h-full max-h-screen flex-col gap-2'>
      <div className='flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6'>
        <Link
          href='/dashboard'
          className='flex items-center gap-2 font-semibold'
        >
          <Video className='h-6 w-6' />
          <span className=''>WatchWise</span>
        </Link>
      </div>

      <div className='flex-1'>
        <nav className='grid items-start px-2 text-sm font-medium lg:px-4'>
          {routes.map((route) => {
            const isActive = pathname === route.href;

            return (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary',
                  isActive
                    ? 'bg-muted text-primary'
                    : 'text-muted-foreground hover:bg-muted'
                )}
              >
                <route.icon className='h-4 w-4' />
                {route.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Нижняя часть сайдбара (можно добавить инфо о лимитах или версию) */}
      <div className='mt-auto p-4'>{/* Заглушка, если понадобится */}</div>
    </div>
  );
};
