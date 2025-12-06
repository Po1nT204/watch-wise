import { auth } from '@/config/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnDashboard = req.nextUrl.pathname.startsWith('/dashboard');
  const isOnAuth =
    req.nextUrl.pathname.startsWith('/login') ||
    req.nextUrl.pathname.startsWith('/register');

  // Если пользователь на странице авторизации и уже вошел -> редирект на дашборд
  if (isOnAuth) {
    if (isLoggedIn) {
      return Response.redirect(new URL('/dashboard', req.nextUrl));
    }
    return; // Разрешаем остаться на /login или /register
  }

  // Если пользователь пытается зайти в дашборд без входа -> редирект на логин
  if (isOnDashboard) {
    if (!isLoggedIn) {
      return Response.redirect(new URL('/login', req.nextUrl));
    }
  }

  return NextResponse.next();
});

// Указываем, для каких путей срабатывает middleware
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
