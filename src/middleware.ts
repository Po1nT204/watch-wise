import NextAuth from 'next-auth';
import { authConfig } from '@/config/auth.config';

// Инициализируем NextAuth только с легким конфигом для Middleware
const { auth } = NextAuth(authConfig);

export default auth(() => {
  // Вся логика редиректов теперь внутри authConfig.callbacks.authorized
  // Middleware просто вызывает эту логику
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
