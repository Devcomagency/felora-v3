'use client'

import { useSession } from 'next-auth/react'
import ModernMediaManager from '@/components/dashboard/ModernMediaManager'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function TestMediaPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return // Still loading
    if (!session) {
      router.push('/auth/signin')
      return
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-purple-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ← Retour
              </button>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                🧪 Test Système Médias Moderne
              </h1>
            </div>
            <div className="text-sm text-gray-400">
              Connecté : {session.user?.email}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Card */}
        <div className="mb-8 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-blue-500/30 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="text-blue-400 text-2xl">ℹ️</div>
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">Page de Test - Nouveau Système Médias</h2>
              <div className="text-gray-300 space-y-2">
                <p>✨ <strong>Fonctionnalités testables :</strong></p>
                <ul className="ml-4 space-y-1 text-sm">
                  <li>• Upload drag & drop (images et vidéos)</li>
                  <li>• Médias publics/privés avec floutage</li>
                  <li>• Système de déblocage avec diamants</li>
                  <li>• Wallet diamants intégré</li>
                  <li>• Interface moderne glassmorphism</li>
                </ul>
                <p className="text-xs text-gray-400 mt-4">
                  ⚠️ Page de test - Aucun impact sur le profil principal
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ModernMediaManager */}
        <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
          <ModernMediaManager />
        </div>

        {/* Debug Info */}
        <div className="mt-8 bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4">
          <h3 className="text-lg font-semibold text-white mb-3">🔧 Debug Info</h3>
          <div className="text-sm text-gray-400 space-y-1">
            <p><strong>User ID:</strong> {(session as any)?.user?.id || 'Non disponible'}</p>
            <p><strong>Session Status:</strong> {status}</p>
            <p><strong>API Endpoints:</strong></p>
            <ul className="ml-4 text-xs">
              <li>• GET /api/media/unlock?mediaId=xxx</li>
              <li>• POST /api/media/unlock (déblocage)</li>
              <li>• GET /api/profile/unified/me (médias)</li>
              <li>• GET /api/diamonds/wallet (wallet)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}