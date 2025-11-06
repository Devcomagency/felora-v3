'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Composant qui vérifie régulièrement si l'utilisateur est suspendu/banni
 * À placer dans le layout principal pour s'exécuter sur toutes les pages
 */
export default function SuspensionChecker() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const lastCheckRef = useRef<number>(0)

  useEffect(() => {
    // ⚠️ NE RIEN FAIRE si l'utilisateur n'est pas connecté (statut "loading" ou "unauthenticated")
    if (status !== 'authenticated') {
      return
    }

    // ✅ Vérifier via API fetch au lieu de update() pour éviter les re-renders
    const checkSuspension = async () => {
      const now = Date.now()

      // Éviter les vérifications trop fréquentes (minimum 5 secondes entre chaque check)
      if (now - lastCheckRef.current < 5000) {
        return
      }

      lastCheckRef.current = now

      try {
        // Vérifier la session via l'API NextAuth directement
        const res = await fetch('/api/auth/session', {
          credentials: 'include'
        })

        if (!res.ok) {
          console.log('🚨 [SUSPENSION CHECKER] Session check failed, redirecting to login')
          router.push('/login?suspended=true')
          return
        }

        const sessionData = await res.json()

        // Si la session est null ou vide, l'utilisateur est suspendu/banni
        if (!sessionData || !sessionData.user) {
          console.log('🚨 [SUSPENSION CHECKER] Session null - user is suspended/banned, redirecting to login')
          router.push('/login?suspended=true')
        }
      } catch (error) {
        console.error('❌ [SUSPENSION CHECKER] Error checking session:', error)
      }
    }

    // Vérifier immédiatement au chargement (seulement si authentifié)
    checkSuspension()

    // Puis vérifier toutes les 30 secondes (au lieu de 5 pour réduire la charge)
    const interval = setInterval(checkSuspension, 30000)

    return () => clearInterval(interval)
  }, [router, status])

  return null // Composant invisible
}
