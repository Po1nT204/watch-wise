import { auth, signOut } from '@/config/auth';

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className='p-10'>
      <h1 className='text-3xl font-bold'>Личный кабинет</h1>
      <p className='mt-4'>Привет, {session?.user?.name || 'Пользователь'}!</p>
      <p className='text-muted-foreground'>Email: {session?.user?.email}</p>

      <form
        action={async () => {
          'use server';
          await signOut();
        }}
      >
        <button
          className='mt-4 px-4 py-2 bg-red-500 text-white rounded'
          type='submit'
        >
          Выйти
        </button>
      </form>
    </div>
  );
}
