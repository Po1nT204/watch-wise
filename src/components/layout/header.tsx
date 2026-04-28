import { UserNav } from './user-nav';
import { Flame } from 'lucide-react';
import prisma from '@/config/prisma';

interface HeaderProps {
  user: {
    id?: string | null;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export const Header = async ({ user }: HeaderProps) => {
  let stats = { level: 1, streak: 0 };
  if (user.id) {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { level: true, streak: true },
    });
    if (dbUser) stats = dbUser;
  }

  return (
    <>
      <div className='w-full flex-1 flex items-center'>
        {/* Можно добавить строку поиска или хлебные крошки в будущем */}
      </div>

      <div className='ml-auto flex items-center gap-4'>
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
    </>
  );
};
