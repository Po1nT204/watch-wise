import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: nextUrl }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.nextUrl.pathname.startsWith('/dashboard');
      const isOnAuth =
        nextUrl.nextUrl.pathname.startsWith('/login') ||
        nextUrl.nextUrl.pathname.startsWith('/register');

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect to login
      }

      if (isOnAuth) {
        if (isLoggedIn) {
          return Response.redirect(new URL('/dashboard', nextUrl.nextUrl));
        }
        return true;
      }

      return true;
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token }) {
      return token;
    },
  },
} satisfies NextAuthConfig;
