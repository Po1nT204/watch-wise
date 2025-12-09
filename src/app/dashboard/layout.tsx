import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { auth } from '@/config/auth';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className='flex min-h-screen w-full flex-col bg-muted/40'>
      {/* Сайдбар: скрыт на мобильных, виден на десктопе (md), фиксирован слева */}
      <aside className='fixed inset-y-0 left-0 z-10 hidden w-72 flex-col border-r bg-background sm:flex'>
        <Sidebar />
      </aside>

      {/* Основной контент: отступ слева (pl-72) равен ширине сайдбара */}
      <div className='flex flex-col sm:gap-4 sm:py-4 sm:pl-72'>
        {/* Хедер: липкий (sticky), чтобы всегда был сверху */}
        <header className='sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6'>
          <Header user={session.user || {}} />
        </header>

        {/* Страница */}
        <main className='grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8'>
          {children}
        </main>
      </div>
    </div>
  );
}
