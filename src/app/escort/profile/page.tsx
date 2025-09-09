'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function EscortProfileRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Rediriger vers la version complète
    router.push('/escort/profile-complete')
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-white">Redirection vers le dashboard complet...</p>
      </div>
    </div>
  )
}