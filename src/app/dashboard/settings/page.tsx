import { auth } from '@/config/auth';
import { redirect } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import prisma from '@/config/prisma';
import { SettingsForm } from '@/components/features/auth/settings-form';

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!dbUser) redirect('/login');

  return (
    <div className='flex flex-col gap-6 p-4 md:p-8 max-w-4xl mx-auto'>
      <div className='flex flex-col gap-2'>
        <h1 className='text-3xl font-bold tracking-tight text-primary'>
          Профиль
        </h1>
        <p className='text-muted-foreground'>
          Персонализируйте ваш аккаунт в WatchWise.
        </p>
      </div>

      <Separator />

      <SettingsForm user={dbUser} />
    </div>
  );
}
