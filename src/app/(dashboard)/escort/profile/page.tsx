'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '../../../../components/dashboard-v2/DashboardLayout'
import { useProfileStatus } from '../../../../hooks/useProfileStatus'
import dynamic from 'next/dynamic'
const ModernProfileEditor = dynamic(() => import('../../../../components/dashboard/ModernProfileEditor'), { ssr: false, loading: () => <div className="h-40 bg-white/5 rounded-xl animate-pulse"/> })

export default function EscortProfilePage() {
  const { profileStatus, updating, toggleStatus } = useProfileStatus()
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [escortId, setEscortId] = useState<string | null>(null)

  // Fonction pour gérer l'activation/pause
  const handleToggleStatus = async () => {
    const result = await toggleStatus()
    
    if (result && result.success) {
      setMessage({ type: 'success', text: result.message })
    } else if (result) {
      let errorText = result.error || 'Une erreur est survenue'
      if (result.missingRequirements) {
        errorText += ': ' + result.missingRequirements.join(', ')
      }
      setMessage({ type: 'error', text: errorText })
    } else {
      setMessage({ type: 'error', text: 'Une erreur est survenue' })
    }

    // Faire disparaître le message après 5 secondes
    setTimeout(() => setMessage(null), 5000)
  }

  // Fetch escortId for preview link
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const r = await fetch('/api/me/escort-profile', { cache: 'no-store', credentials: 'include' })
        const d = await r.json().catch(() => ({}))
        if (!cancelled && d?.escortId) setEscortId(String(d.escortId))
      } catch {}
    })()
    return () => { cancelled = true }
  }, [])

  return (
    <DashboardLayout 
      title="Mon Profil" 
      subtitle="Gérez vos informations personnelles et professionnelles"
    >
      {/* Barre d'actions */}
      <div className="mb-4 flex items-center justify-end gap-2">
        <button
          onClick={() => { try { window.dispatchEvent(new CustomEvent('profile:save' as any)) } catch {} }}
          className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/20 text-white/90"
        >
          Enregistrer
        </button>
        <button
          onClick={handleToggleStatus}
          disabled={updating || (!profileStatus?.canActivate && !profileStatus?.canPause)}
          className={`px-3 py-2 rounded-lg font-semibold ${
            profileStatus && ['ACTIVE','VERIFIED'].includes(profileStatus.status)
              ? 'bg-amber-600 hover:bg-amber-700 text-white'
              : (profileStatus?.completion?.isComplete ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white' : 'bg-gray-700/70 text-gray-300')
          }`}
          title={profileStatus && profileStatus.completion?.isComplete ? '' : 'Complétez les informations requises'}
        >
          {updating ? '…' : (profileStatus && ['ACTIVE','VERIFIED'].includes(profileStatus.status) ? 'Mettre en pause' : 'Activer mon profil')}
        </button>
        {escortId && (
          <a href={`/profile/${escortId}`} target="_blank" rel="noreferrer" className="px-3 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 text-white">Prévisualiser</a>
        )}
      </div>
      {/* Message de statut */}
      {message && (
        <div className={`p-4 rounded-xl mb-6 ${
          message.type === 'success' 
            ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400' 
            : 'bg-red-500/20 border border-red-500/30 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      {/* Bloc statut retiré (actions déplacées en header) */}

      {/* Éditeur de profil */}
      <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
        <ModernProfileEditor />
      </div>
    </DashboardLayout>
  )
}
