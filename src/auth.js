import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import prisma from '@/lib/prisma'
import { verifyPassword } from '@/lib/middleware'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email:    { label: 'Email',  type: 'email'    },
        password: { label: 'Senha',  type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: String(credentials.email) },
        })

        if (!user || !user.is_active) return null
        if (!verifyPassword(String(credentials.password), user.password)) return null

        return {
          id:    String(user.id),
          name:  user.name,
          email: user.email,
          role:  user.role,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,  // 30 dias — mantém o login até o usuário sair ou expirar
    updateAge: 24 * 60 * 60,    // renova o token uma vez por dia de uso
  },
  // trustHost é necessário em produção (Vercel) para o NextAuth confiar no host
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id   = user.id
        token.role = user.role
      }
      return token
    },
    session({ session, token }) {
      session.user.id   = token.id
      session.user.role = token.role
      return session
    },
  },
})
