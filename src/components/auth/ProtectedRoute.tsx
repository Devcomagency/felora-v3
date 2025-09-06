'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: ('CLIENT' | 'ESCORT' | 'ADMIN')[]
  redirectTo?: string
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles,
  redirectTo = '/auth/signin' 
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      router.push(redirectTo)
      return
    }

    if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
      router.push('/unauthorized')
      return
    }
  }, [isAuthenticated, isLoading, user, allowedRoles, router, redirectTo])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div 
            className="inline-block w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mb-4"
            style={{
              borderColor: '#FF6B9D #FF6B9D #FF6B9D transparent'
            }}
          />
          <p className="text-white/60">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
    return null
  }

  return <>{children}</>
}