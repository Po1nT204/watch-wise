import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '@/config/prisma';

// Схема валидации для входа
const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' }, // Используем JWT, так как это проще для Credentials
  pages: {
    signIn: '/login', // Эту страницу сделаем позже
  },
  providers: [
    Credentials({
      name: 'Email and Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        const parsedCredentials = signInSchema.safeParse(credentials);

        if (!parsedCredentials.success) {
          return null;
        }

        const { email, password } = parsedCredentials.data;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.password) {
          return null;
        }

        const passwordsMatch = await bcrypt.compare(password, user.password);

        if (passwordsMatch) {
          return user;
        }

        return null;
      },
    }),
    // Сюда можно будет легко добавить GoogleProvider позже
  ],
  callbacks: {
    // Расширяем сессию, добавляя ID пользователя и роль
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      // Примечание: роль можно вытащить из базы, если нужно будет для админки
      return session;
    },
    async jwt({ token }) {
      return token;
    },
  },
});
