"use client"

import React from 'react'
import { useEscortDashboard } from '@/contexts/EscortDashboardContext'
import { useRouter } from 'next/navigation'

export default function EscortQuickActionsBar() {
  const { status, loading, activate, pause } = useEscortDashboard()
  const router = useRouter()

  return (
    <div className="sticky top-[106px] z-30 bg-black/60 backdrop-blur border border-white/10 rounded-xl px-4 py-2 text-sm flex items-center gap-2 flex-wrap">
      <div className="text-white/80">Actions rapides</div>
      <div className="flex-1" />
      {(status === 'ACTIVE' || status === 'VERIFIED') ? (
        <>
          <button onClick={() => router.push('/profile-test/escort/test')} className="px-3 py-1.5 rounded-lg border border-white/10 text-white/80 hover:bg-white/10">Voir mon profil</button>
          <button onClick={() => router.push('/dashboard-escort/medias')} className="px-3 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-700 text-white">Ajouter des médias</button>
          <button disabled={loading} onClick={pause} className="px-3 py-1.5 rounded-lg border border-yellow-500/30 text-yellow-200 hover:bg-yellow-500/10">Mettre en pause</button>
        </>
      ) : (
        <button disabled={loading} onClick={activate} className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white">Activer mon compte</button>
      )}
    </div>
  )
}

