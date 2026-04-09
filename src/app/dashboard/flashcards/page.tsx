import { auth } from '@/config/auth';
import { redirect } from 'next/navigation';
import prisma from '@/config/prisma';
import { GlobalFlashcards } from '@/components/features/video/global-flashcards';

export default async function FlashcardsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  // Получаем все карточки пользователя с привязкой к видео
  const flashcards = await prisma.flashcard.findMany({
    where: {
      content: {
        userId: session.user.id,
      },
    },
    include: {
      content: {
        include: {
          video: true,
        },
      },
    },
    orderBy: {
      content: {
        createdAt: 'desc',
      },
    },
  });

  return (
    <div className='flex flex-col gap-6 p-4 md:p-8'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>База знаний</h1>
          <p className='text-muted-foreground mt-1'>
            Глобальная библиотека терминов из всех изученных видео.
          </p>
        </div>
      </div>

      <GlobalFlashcards cards={flashcards} />
    </div>
  );
}
