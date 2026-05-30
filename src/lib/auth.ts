import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { compare } from "bcryptjs";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/admin/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("--- ПОПЫТКА ВХОДА ---");
        console.log("Email:", credentials?.email);

        if (!credentials?.email || !credentials?.password) {
          console.log("ОШИБКА: Нет email или пароля");
          return null;
        }

        try {
          const user = await db.adminUser.findUnique({
            where: { email: credentials.email },
          });

          if (!user) {
            console.log("ОШИБКА: Пользователь не найден в БД");
            const count = await db.adminUser.count();
            console.log(`Всего админов в базе: ${count}`);
            return null;
          }

          console.log("Пользователь найден, ID:", user.id);
          console.log("Хеш в базе:", user.password.substring(0, 10) + "...");

          const isPasswordValid = await compare(
            credentials.password,
            user.password,
          );

          console.log("Результат проверки пароля:", isPasswordValid);

          if (!isPasswordValid) {
            console.log("ОШИБКА: Пароль не подошел");
            return null;
          }

          return {
            id: user.id.toString(),
            email: user.email,
            name: "Admin",
          };
        } catch (e) {
          console.error("КРИТИЧЕСКАЯ ОШИБКА DB:", e);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub,
        },
      };
    },
  },
};
