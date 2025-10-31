"use client"

import React from 'react'
import { useEscortDashboard } from '@/contexts/EscortDashboardContext'
import { useRouter } from 'next/navigation'

export default function EscortQuickActionsBar() {
  const { status, loading, error, missingFields, activate, pause } = useEscortDashboard()
  const router = useRouter()

  return (
    <div className="space-y-2">
      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm">
          <div className="text-red-400 font-medium mb-2">{error}</div>
          {missingFields.length > 0 && (
            <div className="space-y-1">
              <div className="text-red-300 text-xs">Informations manquantes :</div>
              <ul className="list-disc list-inside text-red-200/80 text-xs space-y-1 ml-2">
                {missingFields.map((field, index) => (
                  <li key={index}>{field}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Barre d'actions */}
      <div className="bg-black/60 backdrop-blur border border-white/10 rounded-xl px-4 py-2 text-sm flex items-center gap-2 flex-wrap justify-end">
        {(status === 'ACTIVE' || status === 'VERIFIED') ? (
          <>
            <button onClick={() => router.push('/profile-test/escort/test')} className="px-3 py-1.5 rounded-lg border border-white/10 text-white/80 hover:bg-white/10">Voir mon profil</button>
            <button disabled={loading} onClick={pause} className="px-3 py-1.5 rounded-lg border border-yellow-500/30 text-yellow-200 hover:bg-yellow-500/10">Mettre en pause</button>
          </>
        ) : (
          <button disabled={loading} onClick={activate} className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white">Activer mon compte</button>
        )}
      </div>
    </div>
  )
}

