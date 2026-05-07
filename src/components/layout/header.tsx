'use client';

import { UserNav } from './user-nav';
import {
  Flame,
  Menu,
  LayoutDashboard,
  Library,
  LibraryBig,
  Settings,
  Video,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet';

const routes = [
  { label: 'Главная', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Мои видео', icon: Library, href: '/dashboard/videos' },
  { label: 'База знаний', icon: LibraryBig, href: '/dashboard/flashcards' },
  { label: 'Настройки', icon: Settings, href: '/dashboard/settings' },
];

interface HeaderProps {
  user: {
    id?: string | null;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  stats?: {
    level: number;
    streak: number;
  };
}

export const Header = ({
  user,
  stats = { level: 1, streak: 0 },
}: HeaderProps) => {
  const pathname = usePathname();

  return (
    <div className='flex items-center w-full justify-between'>
      <div className='sm:hidden flex items-center'>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant='ghost' size='icon' className='-ml-2 mr-2'>
              <Menu className='h-6 w-6' />
            </Button>
          </SheetTrigger>
          <SheetContent
            side='left'
            className='w-[280px] sm:hidden flex flex-col p-0'
          >
            <SheetTitle className='sr-only'>Навигация</SheetTitle>
            <div className='flex h-14 items-center border-b px-6'>
              <Link
                href='/'
                className='flex items-center gap-2 font-bold text-primary'
              >
                <Video className='h-6 w-6' />
                <span>WatchWise</span>
              </Link>
            </div>
            <div className='flex-1 overflow-y-auto py-4 px-4 space-y-2'>
              {routes.map((route) => {
                const isActive = pathname === route.href;
                return (
                  <Link
                    key={route.href}
                    href={route.href}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-3 py-3 transition-all',
                      isActive
                        ? 'bg-primary/10 text-primary font-bold'
                        : 'text-muted-foreground hover:bg-muted',
                    )}
                  >
                    <route.icon className='h-5 w-5' />
                    {route.label}
                  </Link>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className='ml-auto flex items-center gap-3 sm:gap-4'>
        <div
          className='flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 text-orange-600 border border-orange-500/20'
          title='Дней обучения подряд'
        >
          <Flame
            className={`h-4 w-4 ${stats.streak > 0 ? 'fill-orange-500' : ''}`}
          />
          <span className='text-sm font-bold'>{stats.streak}</span>
        </div>

        <UserNav user={user} level={stats.level} />
      </div>
    </div>
  );
};
