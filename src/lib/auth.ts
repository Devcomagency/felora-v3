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
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
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

        // Mettre à jour lastLoginAt lors de la première connexion (quand user est présent)
        try {
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() }
          })
        } catch (error) {
          console.error('Error updating lastLoginAt:', error)
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        ;(session as any).user.id = token.sub as string
        ;(session as any).user.role = (token as any).role
        
        // Récupérer le profil escort si l'utilisateur est escort
        if ((token as any).role === 'ESCORT') {
          try {
            const escortProfile = await prisma.escortProfile.findUnique({
              where: { userId: token.sub as string },
              select: {
                id: true,
                stageName: true,
                profilePhoto: true
              }
            })

            if (escortProfile) {
              ;(session as any).user.name = escortProfile.stageName || session.user.name
              ;(session as any).user.avatar = escortProfile.profilePhoto
              ;(session as any).user.escortProfileId = escortProfile.id // ✅ Ajouter l'ID du profil
            }
          } catch (error) {
            console.error('Error fetching escort profile:', error)
          }
        }

        // Récupérer le profil club si l'utilisateur est club
        if ((token as any).role === 'CLUB') {
          try {
            const clubProfile = await prisma.clubProfileV2.findUnique({
              where: { userId: token.sub as string },
              select: {
                id: true,
                handle: true,
                companyName: true
              }
            })

            if (clubProfile) {
              ;(session as any).user.name = clubProfile.companyName || session.user.name
              ;(session as any).user.clubHandle = clubProfile.handle // ✅ Ajouter le handle du club
              ;(session as any).user.clubId = clubProfile.id
            }
          } catch (error) {
            console.error('Error fetching club profile:', error)
          }
        }
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login?error=true'
  },
}
