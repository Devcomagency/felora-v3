'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function DashboardRedirectPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (!session?.user) {
      // Pas de session, rediriger vers login
      router.replace('/login')
      return
    }

    // Déterminer la redirection basée sur le rôle
    const userRole = (session.user as any)?.role

    if (userRole === 'ESCORT') {
      router.replace('/dashboard-escort')
    } else if (userRole === 'CLUB') {
      router.replace('/dashboard-club') 
    } else if (userRole === 'ADMIN') {
      router.replace('/admin/dashboard')
    } else {
      // Utilisateur CLIENT ou rôle inconnu - vers page d'accueil
      router.replace('/')
    }
  }, [session, status, router])

  // Affichage pendant la redirection
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/70 text-lg">Redirection en cours...</p>
      </div>
    </div>
  )
}