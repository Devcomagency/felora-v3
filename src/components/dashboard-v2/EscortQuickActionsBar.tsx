"use client"

import React from 'react'
import { useEscortDashboard } from '@/contexts/EscortDashboardContext'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

export default function EscortQuickActionsBar() {
  const t = useTranslations('dashboardEscort.actions')
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
      <div className="hidden sm:flex items-center gap-2 justify-end">
        {(status === 'ACTIVE' || status === 'VERIFIED') ? (
          <>
            <button
              onClick={() => router.push('/profile-test/escort/test')}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              {t('viewProfile')}
            </button>
            <button
              disabled={loading}
              onClick={pause}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-yellow-500/30 text-yellow-200 hover:bg-yellow-500/10 transition-colors disabled:opacity-50"
            >
              {t('pauseAccount')}
            </button>
          </>
        ) : (
          <button
            disabled={loading}
            onClick={activate}
            className="px-3 py-1.5 rounded-lg bg-white text-black text-xs font-semibold hover:bg-neutral-200 transition-colors shadow-lg shadow-white/5 disabled:opacity-50"
          >
            {t('activateAccount')}
          </button>
        )}
      </div>
    </div>
  )
}

