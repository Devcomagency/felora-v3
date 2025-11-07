import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
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

        // Vérifier si le compte est banni définitivement
        if (user.bannedAt) {
          throw new Error(`Votre compte a été banni définitivement. Raison: ${user.bannedReason || 'Non spécifiée'}`)
        }

        // Vérifier si le compte est suspendu temporairement
        if (user.suspendedUntil) {
          const now = new Date()
          if (user.suspendedUntil > now) {
            // Calculer la durée restante
            const timeLeft = user.suspendedUntil.getTime() - now.getTime()
            const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24))
            const hoursLeft = Math.ceil(timeLeft / (1000 * 60 * 60))

            const suspendedUntilFormatted = user.suspendedUntil.toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })

            let durationText = ''
            if (daysLeft > 1) {
              durationText = `Suspension de ${daysLeft} jours`
            } else if (hoursLeft > 1) {
              durationText = `Suspension de ${hoursLeft} heures`
            } else {
              durationText = `Suspension temporaire`
            }

            throw new Error(`${durationText} jusqu'au ${suspendedUntilFormatted}.\n\nRaison: ${user.suspensionReason || 'Non-respect des règles de la plateforme'}`)
          } else {
            // La suspension est expirée, on la supprime
            await prisma.user.update({
              where: { id: user.id },
              data: {
                suspendedUntil: null,
                suspensionReason: null
              }
            })
          }
        }

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
      // Rediriger vers la page d'accueil après connexion
      if (url.includes('/api/auth/callback')) {
        return baseUrl // Page d'accueil
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
      if (!token?.sub) {
        return session
      }

      // ✅ VÉRIFIER LA SUSPENSION SEULEMENT TOUTES LES 5 MINUTES (cache dans le token)
      const now = Date.now()
      const lastCheck = (token as any).lastSuspensionCheck || 0
      const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

      if (now - lastCheck > CACHE_DURATION) {
        try {
          const userId = token.sub as string

          const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
              email: true,
              bannedAt: true,
              bannedReason: true,
              suspendedUntil: true,
              suspensionReason: true
            }
          })

          if (user) {
            // Reset des flags
            ;(token as any).isBanned = false
            ;(token as any).isSuspended = false

            // Bloquer si banni
            if (user.bannedAt) {
              console.log('🚨 [AUTH SESSION] User', user.email, 'is BANNED')
              ;(token as any).isBanned = true
              ;(token as any).bannedReason = user.bannedReason
            }

            // Bloquer si suspendu
            if (user.suspendedUntil) {
              const currentDate = new Date()
              if (user.suspendedUntil > currentDate) {
                console.log('🚨 [AUTH SESSION] User', user.email, 'is SUSPENDED until', user.suspendedUntil)
                ;(token as any).isSuspended = true
                ;(token as any).suspendedUntil = user.suspendedUntil.toISOString()
                ;(token as any).suspensionReason = user.suspensionReason
              } else {
                // La suspension est expirée, on la supprime (async, sans attendre)
                console.log('✅ [AUTH SESSION] Suspension expired for', user.email)
                prisma.user.update({
                  where: { id: userId },
                  data: {
                    suspendedUntil: null,
                    suspensionReason: null
                  }
                }).catch(err => console.error('Error removing expired suspension:', err))
              }
            }
          }

          // Mettre à jour le timestamp de la dernière vérification
          ;(token as any).lastSuspensionCheck = now
        } catch (error) {
          console.error('🚨 [AUTH SESSION] Suspension check error:', error)
        }
      }

      // ✅ TOUJOURS REMPLIR LA SESSION
      ;(session as any).user.id = token.sub as string
      ;(session as any).user.role = (token as any).role

      // Ajouter les flags de suspension/bannissement (depuis le cache du token)
      ;(session as any).user.isBanned = (token as any).isBanned || false
      ;(session as any).user.isSuspended = (token as any).isSuspended || false
      ;(session as any).user.bannedReason = (token as any).bannedReason
      ;(session as any).user.suspendedUntil = (token as any).suspendedUntil
      ;(session as any).user.suspensionReason = (token as any).suspensionReason

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

      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login?error=true'
  },
}
