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

      {/* Boutons déplacés dans le header - cette section n'est plus utilisée */}
    </div>
  )
}

