'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Library,
  Settings,
  Video,
  LibraryBig,
} from 'lucide-react';
import { motion } from 'framer-motion';

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
    label: 'База знаний',
    icon: LibraryBig,
    href: '/dashboard/flashcards',
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
        <Link href='/' className='flex items-center gap-2 font-bold group'>
          <div className='bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20 transition-colors'>
            <Video className='h-5 w-5 text-primary' />
          </div>
          <span className='tracking-tight'>WatchWise</span>
        </Link>
      </div>

      <div className='flex-1 overflow-y-auto py-4'>
        <nav className='grid items-start px-2 text-sm font-medium lg:px-4 gap-1'>
          {routes.map((route) => {
            const isActive = pathname === route.href;

            return (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  'relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all group overflow-hidden',
                  isActive
                    ? 'text-primary font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId='sidebar-active-indicator'
                    className='absolute inset-0 bg-primary/10 border border-primary/20 rounded-xl'
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}

                <route.icon
                  className={cn(
                    'h-4 w-4 relative z-10 transition-transform duration-200',
                    isActive
                      ? 'text-primary scale-110'
                      : 'group-hover:scale-110 group-hover:text-foreground',
                  )}
                />
                <span className='relative z-10'>{route.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
