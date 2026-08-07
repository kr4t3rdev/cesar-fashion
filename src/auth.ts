import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { authConfig } from "@/auth.config";
import { prisma } from "@/server/infrastructure/prisma";
import { verifyPassword, hashPassword } from "@/lib/password";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@cesarfashion.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin1234";

async function ensureAdmin() {
  const existing = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  const passwordHash = await hashPassword(ADMIN_PASSWORD);
  if (!existing) {
    await prisma.user.create({
      data: { email: ADMIN_EMAIL, name: "Cesar Admin", password: passwordHash, role: "admin" },
    });
    return;
  }
  if (!existing.password) {
    await prisma.user.update({
      where: { id: existing.id },
      data: { password: passwordHash },
    });
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        await ensureAdmin();
        const user = await prisma.user.findUnique({
          where: { email: String(credentials.email) },
        });
        if (!user?.password) return null;
        const valid = await verifyPassword(String(credentials.password), user.password);
        if (!valid) return null;
        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role ?? "admin";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.sub as string | undefined) ?? session.user.id;
        (session.user as { role?: string }).role = (token.role as string) ?? "admin";
      }
      return session;
    },
  },
});
