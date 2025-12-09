import { UserNav } from './user-nav';

interface HeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export const Header = ({ user }: HeaderProps) => {
  return (
    <>
      {/* Тут можно будет добавить мобильное меню (Sheet) позже */}

      <div className='w-full flex-1'>
        {/* Сюда можно добавить строку поиска в будущем */}
      </div>

      <div className='ml-auto flex items-center gap-2'>
        <UserNav user={user} />
      </div>
    </>
  );
};
