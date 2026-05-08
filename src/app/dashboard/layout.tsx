import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { auth } from '@/config/auth';
import { redirect } from 'next/navigation';
import prisma from '@/config/prisma';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const user = session?.user;
  let stats = { level: 1, streak: 0 };

  if (user && user.id) {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { level: true, streak: true },
    });
    if (dbUser) stats = dbUser;
  }
  if (!session) {
    redirect('/login');
  }

  return (
    <div className='flex min-h-screen w-full flex-col bg-muted/40'>
      <aside className='fixed inset-y-0 left-0 z-10 hidden w-72 flex-col border-r bg-background sm:flex'>
        <Sidebar />
      </aside>

      <div className='flex flex-col sm:gap-4 sm:py-4 sm:pl-72'>
        <header className='sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6'>
          <Header user={session.user || {}} stats={stats} />
        </header>

        <main className='grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 min-w-0 w-full overflow-x-hidden'>
          {children}
        </main>
      </div>
    </div>
  );
}
