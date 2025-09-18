import type { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({ where: { email: credentials.email } })
        if (!user) return null

        const hash = (user as any).password || (user as any).passwordHash
        if (!hash) return null

        const isPasswordValid = await bcrypt.compare(credentials.password, hash)
        if (!isPasswordValid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name || undefined,
          role: user.role as any,
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 heures
  },
  callbacks: {
    async signIn() {
      return true
    },
    async redirect({ url, baseUrl }) {
      // Pour éviter les erreurs client-side, rediriger directement vers dashboard-escort
      if (url.includes('/api/auth/callback')) {
        return `${baseUrl}/dashboard-escort`
      }
      
      // Pour les autres cas, utiliser l'URL fournie ou la base
      if (url.startsWith('/')) return `${baseUrl}${url}`
      return baseUrl
    },
    async jwt({ token, user }) {
      if (user) {
        ;(token as any).role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        ;(session as any).user.id = token.sub as string
        ;(session as any).user.role = (token as any).role
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login?error=true'
  },
}
