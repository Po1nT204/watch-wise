'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { signOut } from 'next-auth/react';
import Link from 'next/link';

interface UserNavProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  level: number;
}

export function UserNav({ user, level }: UserNavProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='relative h-9 w-9 rounded-full overflow-hidden border-2 border-primary/20 hover:border-primary/50 transition-colors'
        >
          <Avatar className='h-full w-full'>
            <AvatarImage src={user.image || ''} alt={user.name || ''} />
            <AvatarFallback className='font-bold'>
              {user.name?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className='absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full border border-background'>
            {level}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56' align='end' forceMount>
        <DropdownMenuLabel className='font-normal'>
          <div className='flex flex-col space-y-1'>
            <p className='text-sm font-medium leading-none'>{user.name}</p>
            <p className='text-xs leading-none text-muted-foreground'>
              {user.email}
            </p>
            <p className='text-xs font-bold text-primary mt-1'>
              Уровень {level}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href='/dashboard/settings' className='cursor-pointer w-full'>
              Настройки
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })}>
          Выйти
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
