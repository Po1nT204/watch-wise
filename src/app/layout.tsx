import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';
import { Metadata } from 'next';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'WatchWise | Обучение, которое невозможно проспать',
    template: '%s | WatchWise',
  },
  description:
    'Интерактивная AI-платформа для анализа образовательного видеоконтента. Автоматическая генерация конспектов, тестов и флеш-карточек с помощью нейросетей (YandexGPT).',
  keywords: [
    'EdTech',
    'AI',
    'образование',
    'видео',
    'конспекты',
    'тесты',
    'YandexGPT',
    'WatchWise',
  ],
  authors: [{ name: 'Егор Степанов' }],
  creator: 'Егор Степанов',
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: 'https://watchwise.ru',
    title: 'WatchWise — Интерактивная AI-платформа',
    description:
      'Превращаем пассивный просмотр лекций в активное обучение с помощью нейросетей. Попробуйте умную паузу прямо сейчас.',
    siteName: 'WatchWise',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='ru'>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster position='top-center' richColors />
      </body>
    </html>
  );
}
